import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootScreenshotsDir = path.resolve(__dirname, '..', 'screenshots');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const BASE_URL = 'http://127.0.0.1:5173';
const API_URL = 'http://127.0.0.1:5000/api/v1';

async function getAdminToken() {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'admin', password: 'Admin123!' })
    });
    const data = await res.json();
    if (data.success && data.data && data.data.token) {
      console.log('✓ Successfully authenticated as Admin');
      return data.data.token;
    }
  } catch (err) {
    console.warn('! Failed to authenticate via API:', err.message);
  }
  return null;
}

const screenshotTasks = [
  // 1. Landing & Auth
  {
    category: '01_landing_and_auth',
    file: '01_homepage_hero.png',
    path: '/',
    auth: false,
    title: 'Homepage & Platform Hero',
    description: 'Hero section highlighting developer ecosystem, CTA buttons, platform stats and live metric indicators.'
  },
  {
    category: '01_landing_and_auth',
    file: '02_login_page.png',
    path: '/login',
    auth: false,
    title: 'Authentication & Login',
    description: 'Clean dark login view with quick demo credentials hints for testing.'
  },
  {
    category: '01_landing_and_auth',
    file: '03_register_page.png',
    path: '/register',
    auth: false,
    title: 'Student Registration',
    description: 'Registration form with username, email, password validation and role onboarding.'
  },

  // 2. Coding & Practice
  {
    category: '02_coding_and_problems',
    file: '01_problems_library.png',
    path: '/problems',
    auth: false,
    title: 'Algorithmic Problem Library',
    description: 'Categorized problem catalog with difficulty tags (Easy, Medium, Hard), acceptance rates, and search filters.'
  },
  {
    category: '02_coding_and_problems',
    file: '02_problem_workspace.png',
    path: '/problems/two-sum',
    auth: true,
    title: 'Monaco Code Workspace & Test Runner',
    description: 'In-browser VS Code editor with language switcher, problem statement, constraints, and test execution console.',
    action: async (page) => {
      await page.waitForSelector('.monaco-editor', { timeout: 10000 }).catch(() => {});
    }
  },
  {
    category: '02_coding_and_problems',
    file: '03_ai_mentor_hints.png',
    path: '/problems/two-sum',
    auth: true,
    title: 'AI Mentor Progressive Hints Engine',
    description: 'Interactive 4-tier pedagogical hints system unlocking conceptual intuition, algorithmic strategy, and edge cases.',
    action: async (page) => {
      // Click the AI Mentor tab
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('AI Mentor')) {
          await btn.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 1000));
      // Unlock level 1 and 2 hints if buttons present
      const hintBtns = await page.$$('button');
      for (const hBtn of hintBtns) {
        const text = await page.evaluate(el => el.textContent, hBtn);
        if (text && text.includes('Unlock')) {
          await hBtn.click();
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }
  },

  // 3. Interactive Learning
  {
    category: '03_interactive_learning',
    file: '01_dsa_visualizer_sorting.png',
    path: '/visualizer',
    auth: false,
    title: 'Interactive DSA Sorting Visualizer',
    description: 'Animated sorting algorithms (Bubble, Selection, Insertion) with color-coded comparison/swap states and playback controls.'
  },
  {
    category: '03_interactive_learning',
    file: '02_dsa_visualizer_bst.png',
    path: '/visualizer',
    auth: false,
    title: 'Binary Search Tree (BST) Visualizer',
    description: 'Visual tree construction with interactive node insertion, traversal pathing, and responsive SVG canvas.',
    action: async (page) => {
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Binary Search Tree')) {
          await btn.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  },
  {
    category: '03_interactive_learning',
    file: '03_engineering_roadmaps.png',
    path: '/learning',
    auth: false,
    title: 'Engineering Learning Hub & Roadmaps',
    description: 'Structured curricula for Algorithmic Mastery, Full-Stack Architecture, and ML Foundations with milestone tracking.'
  },

  // 4. Community Discussions
  {
    category: '04_community_discussions',
    file: '01_community_forum.png',
    path: '/community',
    auth: false,
    title: 'Developer Community Discussion Forum',
    description: 'StackOverflow-style technical Q&A board with voting scores, answers badges, topic tags, and sorting filters.'
  },
  {
    category: '04_community_discussions',
    file: '02_question_detail_thread.png',
    path: '/community/questions/1',
    auth: false,
    title: 'Technical Discussion Thread',
    description: 'Detailed question view with Markdown code blocks, accepted answer highlight, author cards, and threaded comments.'
  },

  // 5. Blogs & Editorial
  {
    category: '05_blogs_and_editorial',
    file: '01_blogs_explore.png',
    path: '/blogs',
    auth: false,
    title: 'Student Blogs & Technical Articles',
    description: 'Student engineering articles with category filtering, reading time estimates, like counters, and author badges.'
  },
  {
    category: '05_blogs_and_editorial',
    file: '02_blog_article_reading.png',
    path: '/blogs/1',
    auth: false,
    title: 'Technical Article Reading View',
    description: 'Full-length tutorial view with syntax highlighting, featured cover image, like interaction, and discussion comments.'
  },
  {
    category: '05_blogs_and_editorial',
    file: '03_editorial_cadence_desk.png',
    path: '/blogs/editorial',
    auth: true,
    title: 'Editorial Cadence & Review Desk',
    description: 'Admin/moderator publication queue with 7-day cadence gap detection, approve/reject review modals, and category manager.'
  },

  // 6. Project Showcase & Code Reviews
  {
    category: '06_showcase_and_reviews',
    file: '01_project_showcase.png',
    path: '/projects',
    auth: false,
    title: 'Project Portfolio Showcase',
    description: 'Student project directory with GitHub links, live demo buttons, tech stack tags, and community upvotes.'
  },
  {
    category: '06_showcase_and_reviews',
    file: '02_project_detail_and_peer_reviews.png',
    path: '/projects/1',
    auth: true,
    title: 'Project Details & 4-Pillar Peer Reviews',
    description: 'Showcase detail with screenshot carousel and structured code reviews (Architecture, Performance, Security, UI/UX).'
  },

  // 7. Clubs & Events
  {
    category: '07_clubs_and_events',
    file: '01_clubs_discovery.png',
    path: '/clubs',
    auth: false,
    title: 'Campus Technical Clubs Directory',
    description: 'Student guilds (Open Source, Competitive Programming, AI Society) with member rosters and announcements feed.'
  },
  {
    category: '07_clubs_and_events',
    file: '02_club_detail_and_announcements.png',
    path: '/clubs/1',
    auth: true,
    title: 'Club Hub & Broadcast Announcements',
    description: 'Club homepage with officer leadership team, member directory, and broadcast announcements feed.'
  },
  {
    category: '07_clubs_and_events',
    file: '03_event_media_gallery.png',
    path: '/events',
    auth: false,
    title: 'Event Media & Memories Gallery',
    description: 'Card-based gallery of campus hackathons, coding contests, seminars, and technical workshops with year filtering.'
  },
  {
    category: '07_clubs_and_events',
    file: '04_event_detail_albums.png',
    path: '/events/1',
    auth: false,
    title: 'Event Detail & Media Albums',
    description: 'Event details with cover photo, key highlights, organizing club details, and responsive photo album grid.'
  },

  // 8. Profiles, Leaderboard & Admin
  {
    category: '08_profiles_and_leaderboard',
    file: '01_user_profile_badges.png',
    path: '/profile/developer',
    auth: false,
    title: 'User Profile & Dynamic Recognition Badges',
    description: 'User profile showcasing genuine activity badges (Project Creator, Code Inspector, Tech Writer), solve stats, and published articles.'
  },
  {
    category: '08_profiles_and_leaderboard',
    file: '02_global_leaderboard.png',
    path: '/leaderboard',
    auth: false,
    title: 'Global Competitive Leaderboard',
    description: 'Server-verified developer rankings with solved problem counts, points, difficulty breakdown, and rank badges.'
  },
  {
    category: '08_profiles_and_leaderboard',
    file: '03_admin_dashboard.png',
    path: '/admin',
    auth: true,
    title: 'Platform Administration & System Metrics',
    description: 'Admin suite with live platform health metrics, user role management, content moderation reports, and audit logging.'
  }
];

async function main() {
  console.log('====================================================');
  console.log('   SCRIPTORIUM — Screenshot Generation Suite');
  console.log('====================================================');
  console.log('Browser:', BROWSER_PATH);

  const adminToken = await getAdminToken();

  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  for (let i = 0; i < screenshotTasks.length; i++) {
    const task = screenshotTasks[i];
    const targetDir = path.join(rootScreenshotsDir, task.category);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const outputPath = path.join(targetDir, task.file);

    console.log(`[${i + 1}/${screenshotTasks.length}] Capturing: ${task.title} (${task.path}) ...`);

    try {
      // Configure local storage before page loads
      await page.evaluateOnNewDocument((token, needsAuth) => {
        localStorage.setItem('scriptorium_theme', 'dark');
        document.documentElement.classList.add('dark');
        if (needsAuth && token) {
          localStorage.setItem('scriptorium_token', token);
        } else if (!needsAuth) {
          localStorage.removeItem('scriptorium_token');
        }
      }, adminToken, task.auth);

      await page.goto(`${BASE_URL}${task.path}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      }).catch(async () => {
        await page.goto(`${BASE_URL}${task.path}`, { waitUntil: 'load', timeout: 15000 });
      });

      // Ensure dark theme class is present
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('scriptorium_theme', 'dark');
      });

      // Allow any CSS transitions / animations / API fetch to settle
      await new Promise(r => setTimeout(r, 1200));

      if (task.action) {
        try {
          await task.action(page);
          await new Promise(r => setTimeout(r, 800));
        } catch (actErr) {
          console.warn(`  ! Action hook warning: ${actErr.message}`);
        }
      }

      await page.screenshot({
        path: outputPath,
        fullPage: false // Captures clean 1440x900 viewport hero
      });

      const stats = fs.statSync(outputPath);
      console.log(`  ✓ Saved: ${task.file} (${Math.round(stats.size / 1024)} KB)`);
    } catch (err) {
      console.error(`  ✗ Error capturing ${task.file}:`, err.message);
    }
  }

  await browser.close();
  console.log('\n✓ All screenshots captured successfully!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
