# Software Requirements Specification (SRS)

## SCRIPTORIUM

**Developer Community and Online Coding Practice Platform**

  Document field      Value
  ------------------- -------------------------------------
  Document title      Software Requirements Specification
  Project name        SCRIPTORIUM
  Version             1.0
  Status              Initial baseline
  Date                4 November 2026
  Project type        Full-stack web application
  Intended audience   Programming students and developers

------------------------------------------------------------------------

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional
and non-functional requirements for **SCRIPTORIUM**, a web-based
platform that combines a programming discussion community with an online
coding practice environment.

The document establishes a shared understanding of the product's scope,
users, features, constraints, interfaces, data requirements and quality
expectations. It is intended to guide planning, design, implementation,
testing and future maintenance.

### 1.2 Product scope

SCRIPTORIUM will provide one place where users can:

-   Ask programming questions and share technical knowledge.
-   Answer questions, comment, vote and mark useful answers.
-   Browse programming problems by topic and difficulty.
-   Write and submit code through an in-browser editor.
-   View submission results and track learning progress.
-   Earn points, badges and leaderboard positions.
-   Build a public developer profile and connect with other learners.

The platform will also provide administrative tools for managing users,
content, coding problems and reports.

The long-term vision includes timed contests, code battles, study groups
and AI-assisted explanations. These are planned extensions and are not
required for the first usable release.

### 1.3 Intended audience

This document is intended for:

-   The student developer or project team.
-   Project supervisors and academic evaluators.
-   UI/UX designers.
-   Backend and frontend developers.
-   Database designers.
-   Software testers and future maintainers.

### 1.4 Definitions and abbreviations

  -----------------------------------------------------------------------
  Term                                Meaning
  ----------------------------------- -----------------------------------
  SRS                                 Software Requirements Specification

  UI                                  User Interface

  API                                 Application Programming Interface

  IDE                                 Integrated Development Environment

  DBMS                                Database Management System

  RBAC                                Role-Based Access Control

  CRUD                                Create, Read, Update and Delete

  JWT                                 JSON Web Token

  Test case                           An input and expected result used
                                      to verify a program

  Submission                          Source code sent by a user for
                                      evaluation

  Judge service                       Isolated service that compiles or
                                      runs submitted code

  Moderator                           Authorized user who reviews
                                      community content

  Admin                               User with platform-management
                                      privileges
  -----------------------------------------------------------------------

### 1.5 References and standards

The project should use these as guidance during implementation:

-   ISO/IEC/IEEE 29148 requirements-engineering principles.
-   OWASP Application Security Verification Standard and OWASP Top 10
    guidance.
-   WCAG 2.2 accessibility guidance.
-   HTTP and REST API conventions.
-   Applicable privacy, data-protection and copyright requirements.

This document is a project-specific specification and does not claim
formal certification against any standard.

------------------------------------------------------------------------

## 2. Overall description

### 2.1 Product perspective

SCRIPTORIUM is a browser-accessible, client-server application. Its
major logical components are:

1.  Frontend web application.
2.  Backend application and REST API.
3.  Relational database.
4.  Code-execution/judging service.
5.  Optional notification and email service.
6.  Administrative interface.

The code-execution service must be isolated from the main application
server. User-submitted code must never be executed directly inside the
trusted web application process.

### 2.2 Product objectives

The platform shall:

-   Make programming practice accessible through a browser.
-   Encourage peer-to-peer learning and technical discussion.
-   Provide a structured collection of programming challenges.
-   Give users understandable feedback on code submissions.
-   Help users measure learning activity and progress.
-   Maintain a respectful, moderated developer community.
-   Support future growth in users, problems and features.

### 2.3 User classes and roles

  -----------------------------------------------------------------------
  Role                    Description             Main permissions
  ----------------------- ----------------------- -----------------------
  Guest                   Visitor without an      Browse public pages,
                          account                 problems and public
                                                  discussions

  Registered user         Authenticated platform  Ask, answer, comment,
                          member                  vote, submit code and
                                                  manage own profile

  Moderator               Trusted community       Review reports,
                          manager                 moderate posts and
                                                  manage flagged content

  Problem setter          Authorized contributor  Create and edit coding
                                                  problems and test cases

  Administrator           Platform operator       Manage users, roles,
                                                  content, configuration
                                                  and audit records
  -----------------------------------------------------------------------

A user may hold more than one authorized role. Administrative
permissions must be enforced by the backend, not merely hidden in the
interface.

### 2.4 Operating environment

The system is intended to support:

-   Modern desktop and mobile browsers.
-   Responsive layouts for phones, tablets and desktop screens.
-   A frontend built with React, HTML, CSS and JavaScript.
-   A backend built with Python and Flask.
-   MySQL as the primary relational database.
-   A separately deployed, sandboxed code-execution service.

Exact supported browser versions and hosting specifications will be
selected before production deployment.

### 2.5 Constraints

-   A network connection is required for account-based and server-backed
    features.
-   Code execution depends on an available judge service.
-   Supported programming languages depend on the judge service
    configuration.
-   The database must enforce referential integrity and suitable
    uniqueness constraints.
-   Secrets, credentials and signing keys must not be committed to
    source control.
-   The system must follow the selected hosting provider's resource and
    deployment limits.
-   Production use requires security, privacy, backup and operational
    procedures beyond a classroom demonstration.

### 2.6 Assumptions and dependencies

-   Users have access to a modern web browser and internet connection.
-   Users provide an email address or another supported identifier for
    account registration.
-   The platform operator supplies and maintains hosting and database
    infrastructure.
-   A code-execution provider or self-hosted sandbox is available for
    programming submissions.
-   Email delivery, if enabled, depends on a configured email service.
-   The initial product language is English; internationalization may be
    added later.

------------------------------------------------------------------------

## 3. Functional requirements

Requirements use identifiers so they can be traced into design and test
cases. "Shall" indicates a required system behaviour.

### 3.1 Account registration and authentication

  --------------------------------------------------------------------------
  ID                      Requirement                Priority
  ----------------------- -------------------------- -----------------------
  FR-AUTH-01              The system shall allow a   Must
                          guest to register using    
                          the required account       
                          fields.                    

  FR-AUTH-02              The system shall validate  Must
                          registration data on the   
                          server.                    

  FR-AUTH-03              The system shall prevent   Must
                          duplicate accounts using a 
                          unique email or username   
                          policy.                    

  FR-AUTH-04              The system shall securely  Must
                          store password hashes and  
                          shall never store          
                          plaintext passwords.       

  FR-AUTH-05              The system shall allow     Must
                          registered users to log in 
                          and log out.               

  FR-AUTH-06              The system shall support a Should
                          secure password-reset      
                          process.                   

  FR-AUTH-07              The system shall enforce   Must
                          authorization checks for   
                          protected operations.      

  FR-AUTH-08              The system shall allow     Must
                          users to update permitted  
                          account and profile        
                          details.                   

  FR-AUTH-09              The system shall support   Should
                          account deactivation or    
                          deletion according to the  
                          platform's retention       
                          policy.                    

  FR-AUTH-10              The system shall apply     Must
                          rate limits to             
                          authentication-sensitive   
                          endpoints.                 
  --------------------------------------------------------------------------

### 3.2 Developer profiles

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  FR-PROF-01              Each registered user    Must
                          shall have a profile    
                          page.                   

  FR-PROF-02              Users shall be able to  Should
                          edit their display      
                          name, biography and     
                          profile image.          

  FR-PROF-03              Profiles shall display  Must
                          permitted public        
                          activity, such as       
                          questions, answers and  
                          solved problems.        

  FR-PROF-04              Profiles shall display  Should
                          skills or               
                          programming-language    
                          interests selected by   
                          the user.               

  FR-PROF-05              Users shall be able to  Should
                          control the visibility  
                          of supported profile    
                          information.            
  -----------------------------------------------------------------------

### 3.3 Community questions and discussions

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  FR-COM-01               Authenticated users     Must
                          shall be able to create 
                          a question with a title 
                          and body.               

  FR-COM-02               Users shall be able to  Must
                          attach relevant tags to 
                          a question.             

  FR-COM-03               Users shall be able to  Must
                          edit or delete their    
                          own eligible content.   

  FR-COM-04               Users shall be able to  Must
                          browse and open public  
                          questions.              

  FR-COM-05               Authenticated users     Must
                          shall be able to post   
                          answers to questions.   

  FR-COM-06               Users shall be able to  Should
                          comment on supported    
                          discussion content.     

  FR-COM-07               Users shall be able to  Must
                          upvote or downvote      
                          eligible content,       
                          subject to one vote per 
                          user per target.        

  FR-COM-08               The question owner      Should
                          shall be able to mark   
                          an answer as accepted.  

  FR-COM-09               The system shall        Must
                          support sorting and     
                          filtering questions by  
                          recency, activity,      
                          votes and tags.         

  FR-COM-10               Users shall be able to  Must
                          report inappropriate or 
                          abusive content.        

  FR-COM-11               The system shall        Must
                          preserve author and     
                          timestamp information   
                          for content.            

  FR-COM-12               The system shall        Must
                          prevent unauthorized    
                          editing or deletion of  
                          another user's content. 
  -----------------------------------------------------------------------

### 3.4 Coding problem library

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  FR-PROB-01              Users shall be able to  Must
                          browse a list of coding 
                          problems.               

  FR-PROB-02              Each problem shall      Must
                          contain a title,        
                          statement, input        
                          format, output format   
                          and constraints.        

  FR-PROB-03              Each problem shall have Must
                          a difficulty level.     

  FR-PROB-04              Problems shall support  Must
                          topic tags and          
                          supported programming   
                          languages.              

  FR-PROB-05              Users shall be able to  Must
                          search and filter       
                          problems by title,      
                          topic and difficulty.   

  FR-PROB-06              Authorized problem      Should
                          setters shall be able   
                          to create and edit      
                          problems.               

  FR-PROB-07              The system shall        Must
                          support sample test     
                          cases visible to users. 

  FR-PROB-08              The system shall        Must
                          support private test    
                          cases used for judging  
                          submissions.            

  FR-PROB-09              The system shall track  Must
                          whether a user has      
                          solved a problem.       
  -----------------------------------------------------------------------

### 3.5 Online code editor and submissions

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  FR-CODE-01              The problem workspace   Must
                          shall provide an        
                          in-browser code editor. 

  FR-CODE-02              Users shall be able to  Must
                          select from the         
                          programming languages   
                          enabled by the          
                          platform.               

  FR-CODE-03              Users shall be able to  Must
                          write and submit source 
                          code for a selected     
                          problem.                

  FR-CODE-04              The system shall send   Must
                          submissions to an       
                          isolated judging        
                          service.                

  FR-CODE-05              The system shall        Must
                          associate each          
                          submission with its     
                          user, problem, language 
                          and submission time.    

  FR-CODE-06              The system shall        Must
                          display the judging     
                          status and result when  
                          available.              

  FR-CODE-07              The system shall        Must
                          support results such as 
                          Accepted, Wrong Answer, 
                          Compilation Error,      
                          Runtime Error, Time     
                          Limit Exceeded and      
                          Internal Error, where   
                          applicable.             

  FR-CODE-08              The system shall        Must
                          enforce configured      
                          execution time, memory  
                          and output limits.      

  FR-CODE-09              Users shall be able to  Must
                          view their own          
                          submission history.     

  FR-CODE-10              Users shall not be able Must
                          to access hidden        
                          test-case data or       
                          another user's private  
                          submissions unless      
                          explicitly authorized.  

  FR-CODE-11              The system should allow Should
                          users to run code       
                          against sample or       
                          custom input where      
                          supported.              

  FR-CODE-12              The system should       Could
                          autosave editor drafts  
                          locally or through an   
                          authenticated draft     
                          service.                
  -----------------------------------------------------------------------

### 3.6 Progress, points and leaderboards

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  FR-PROG-01              The dashboard shall     Must
                          show the user's         
                          solved-problem count.   

  FR-PROG-02              The dashboard shall     Must
                          show recent submissions 
                          and their results.      

  FR-PROG-03              The system shall        Should
                          calculate progress by   
                          supported problem       
                          categories and          
                          difficulty.             

  FR-PROG-04              The system shall award  Should
                          points according to a   
                          documented scoring      
                          policy.                 

  FR-PROG-05              The system shall        Should
                          provide a leaderboard   
                          based on the configured 
                          scoring policy.         

  FR-PROG-06              The system shall        Could
                          support weekly, monthly 
                          or all-time leaderboard 
                          views.                  

  FR-PROG-07              The system shall award  Could
                          badges for defined      
                          achievements.           

  FR-PROG-08              The system shall        Must
                          prevent duplicate       
                          rewards for the same    
                          qualifying event.       
  -----------------------------------------------------------------------

### 3.7 Notifications

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  FR-NOT-01               The system should       Should
                          notify users about      
                          relevant answers,       
                          comments and accepted   
                          answers.                

  FR-NOT-02               The system should       Should
                          notify users about      
                          moderation actions      
                          affecting their         
                          content.                

  FR-NOT-03               Users should be able to Should
                          mark notifications as   
                          read.                   

  FR-NOT-04               Users should be able to Could
                          configure supported     
                          notification            
                          preferences.            
  -----------------------------------------------------------------------

### 3.8 Administration and moderation

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  FR-ADMIN-01             Administrators shall    Must
                          have a protected        
                          administrative          
                          dashboard.              

  FR-ADMIN-02             Administrators shall be Must
                          able to view, suspend   
                          or reactivate user      
                          accounts.               

  FR-ADMIN-03             Authorized              Must
                          administrators shall be 
                          able to assign and      
                          revoke roles.           

  FR-ADMIN-04             Moderators shall be     Must
                          able to review reported 
                          content.                

  FR-ADMIN-05             Authorized moderators   Must
                          shall be able to hide   
                          or remove content under 
                          documented moderation   
                          rules.                  

  FR-ADMIN-06             Administrators shall be Should
                          able to manage problem  
                          metadata and            
                          publication status.     

  FR-ADMIN-07             Administrative actions  Must
                          shall be recorded in an 
                          audit log.              

  FR-ADMIN-08             The system shall        Must
                          prevent ordinary users  
                          from accessing          
                          administrative          
                          functions.              
  -----------------------------------------------------------------------

### 3.9 Search and discovery

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  FR-SEARCH-01            Users shall be able to  Must
                          search public questions 
                          and coding problems.    

  FR-SEARCH-02            Search results shall    Must
                          support pagination.     

  FR-SEARCH-03            Users shall be able to  Should
                          discover content        
                          through tags and        
                          categories.             

  FR-SEARCH-04            Search shall not expose Must
                          private, deleted or     
                          restricted content to   
                          unauthorized users.     
  -----------------------------------------------------------------------

### 3.10 Future enhancements

The following features are outside the initial release baseline but may
be introduced after the core platform is stable:

-   Real-time one-versus-one code battles.
-   Scheduled programming contests.
-   Study groups and collaborative learning spaces.
-   AI-assisted code explanations and hints.
-   Personalized problem recommendations.
-   Social following and activity feeds.
-   Achievement certificates.
-   Additional languages and localization.

------------------------------------------------------------------------

## 4. External interface requirements

### 4.1 User interface

The UI shall:

-   Use a modern professional visual style inspired by developer tools
    and coding platforms.
-   Use a consistent design system for typography, spacing, buttons,
    forms and alerts.
-   Provide clear navigation between Community, Problems, Code
    Workspace, Leaderboard and Profile.
-   Display loading, empty, success and error states.
-   Confirm destructive actions where appropriate.
-   Use readable code formatting and syntax highlighting.
-   Adapt to desktop, tablet and mobile screen sizes.
-   Provide accessible labels and keyboard-operable controls.

### 4.2 Software interfaces

  -----------------------------------------------------------------------
  Component                           Interface
  ----------------------------------- -----------------------------------
  React frontend                      Communicates with backend through
                                      HTTPS APIs

  Flask backend                       Exposes versioned REST endpoints

  MySQL                               Stores persistent relational data

  Judge service                       Receives code submissions and
                                      returns execution results

  Email provider                      Sends verification and
                                      password-reset messages, if enabled

  Object storage                      Stores profile images and other
                                      permitted uploaded files, if
                                      configured
  -----------------------------------------------------------------------

### 4.3 API conventions

-   API routes should be versioned, for example `/api/v1/`.
-   Requests and responses should use JSON unless a specific upload
    format is required.
-   Appropriate HTTP methods and status codes should be used.
-   Errors should follow a consistent response structure.
-   Authentication and authorization must be checked server-side.
-   Pagination, filtering and sorting parameters should be documented.
-   API secrets and internal infrastructure details must not be returned
    to clients.

### 4.4 Communication interfaces

-   All production browser-to-server communication shall use HTTPS.
-   The backend-to-judge connection shall use authenticated
    service-to-service communication.
-   Sensitive data shall not be transmitted through insecure channels.
-   WebSocket communication may be introduced later for real-time
    features.

------------------------------------------------------------------------

## 5. Data requirements and database design

### 5.1 Proposed entities

The following relational entities form the initial database design.
Table and column names are proposed and may be refined during
implementation.

  Entity/table            Purpose
  ----------------------- --------------------------------------------
  users                   Account credentials and core user identity
  roles                   Available system roles
  user_roles              User-to-role assignments
  profiles                Public profile details
  questions               Community questions
  answers                 Answers to questions
  comments                Comments on supported content
  tags                    Topic labels
  question_tags           Many-to-many question/tag mapping
  votes                   User votes on eligible content
  problems                Coding problem definitions
  problem_tags            Many-to-many problem/tag mapping
  test_cases              Sample and private judging test cases
  submissions             User code submissions and results
  user_problem_progress   Per-user problem status
  badges                  Achievement definitions
  user_badges             Badges earned by users
  notifications           User notifications
  reports                 User-submitted content reports
  audit_logs              Sensitive administrative activity

### 5.2 Main database relationships

-   One user can have one profile.
-   One user can have multiple roles, and one role can belong to
    multiple users.
-   One user can create many questions.
-   One question can have many answers.
-   One question can have many comments.
-   One question can have many tags, and one tag can be associated with
    many questions.
-   One user can vote on many eligible content items.
-   One problem can have many test cases.
-   One user can make many submissions.
-   One problem can receive many submissions.
-   One user can solve many problems, and one problem can be solved by
    many users.
-   One user can earn many badges, and one badge can be earned by many
    users.
-   One user can receive many notifications.
-   One user can submit many reports.

### 5.3 Relationship overview

``` mermaid
erDiagram
    USERS ||--|| PROFILES : has
    USERS ||--o{ USER_ROLES : assigned
    ROLES ||--o{ USER_ROLES : contains
    USERS ||--o{ QUESTIONS : creates
    QUESTIONS ||--o{ ANSWERS : receives
    USERS ||--o{ ANSWERS : writes
    QUESTIONS ||--o{ COMMENTS : has
    USERS ||--o{ COMMENTS : writes
    QUESTIONS ||--o{ QUESTION_TAGS : categorized
    TAGS ||--o{ QUESTION_TAGS : labels
    USERS ||--o{ VOTES : casts
    PROBLEMS ||--o{ TEST_CASES : contains
    PROBLEMS ||--o{ SUBMISSIONS : receives
    USERS ||--o{ SUBMISSIONS : makes
    USERS ||--o{ USER_PROBLEM_PROGRESS : tracks
    PROBLEMS ||--o{ USER_PROBLEM_PROGRESS : tracks
    USERS ||--o{ USER_BADGES : earns
    BADGES ||--o{ USER_BADGES : awarded
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ REPORTS : submits
```

### 5.4 Data integrity rules

-   Every primary entity shall have a primary key.
-   Foreign keys shall enforce valid relationships.
-   User email and username uniqueness shall be enforced according to
    account policy.
-   A user shall have at most one vote for a given target and vote type
    policy.
-   A user shall have at most one progress record per problem.
-   A user shall not earn the same badge more than once unless the badge
    is explicitly repeatable.
-   Submission records shall retain the result and timestamps needed for
    history.
-   Private test cases shall be inaccessible through public APIs.
-   Deletion and retention behaviour shall be defined for accounts and
    user-generated content.

### 5.5 Data classification

  -----------------------------------------------------------------------
  Classification          Examples                Protection
  ----------------------- ----------------------- -----------------------
  Public                  Published questions,    Public read access
                          public profiles,        where intended
                          published problems      

  Internal                Moderation queues,      Authorized staff access
                          platform metrics        

  Personal                Email, profile          Restricted access and
                          settings, account data  appropriate retention

  Sensitive operational   Password hashes,        Strong access controls;
                          tokens, secrets,        never expose to public
                          private test cases      clients
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 6. Non-functional requirements

### 6.1 Performance

  -----------------------------------------------------------------------
  ID                                  Requirement
  ----------------------------------- -----------------------------------
  NFR-PERF-01                         Under the agreed normal test load,
                                      common page and API operations
                                      should respond within 2 seconds at
                                      the 95th percentile, excluding code
                                      execution and large uploads.

  NFR-PERF-02                         Long-running code submissions shall
                                      be processed asynchronously rather
                                      than blocking ordinary web
                                      requests.

  NFR-PERF-03                         The application shall paginate
                                      large question, problem and
                                      submission lists.

  NFR-PERF-04                         Database queries and indexes shall
                                      be reviewed against representative
                                      workloads.
  -----------------------------------------------------------------------

These targets are initial engineering goals and must be validated
through load testing.

### 6.2 Security

  -----------------------------------------------------------------------
  ID                                  Requirement
  ----------------------------------- -----------------------------------
  NFR-SEC-01                          Passwords shall be stored using a
                                      suitable slow password-hashing
                                      algorithm such as Argon2id or
                                      bcrypt with appropriate
                                      configuration.

  NFR-SEC-02                          Production traffic shall use HTTPS.

  NFR-SEC-03                          The backend shall enforce
                                      authentication, authorization and
                                      ownership checks.

  NFR-SEC-04                          Inputs shall be validated and
                                      output safely encoded to reduce
                                      injection and cross-site scripting
                                      risks.

  NFR-SEC-05                          Database access shall use
                                      parameterized queries or a safely
                                      configured ORM.

  NFR-SEC-06                          CSRF protections shall be used
                                      where the chosen authentication
                                      approach requires them.

  NFR-SEC-07                          Authentication endpoints shall have
                                      rate limiting and abuse
                                      protections.

  NFR-SEC-08                          Secrets shall be stored outside
                                      source code and protected
                                      deployment configuration.

  NFR-SEC-09                          Code execution shall occur in
                                      isolated, resource-limited
                                      environments with restricted
                                      network and filesystem access.

  NFR-SEC-10                          Logs shall not contain plaintext
                                      passwords, authentication tokens or
                                      unnecessary personal data.

  NFR-SEC-11                          Dependencies shall be reviewed and
                                      updated to address known
                                      vulnerabilities.

  NFR-SEC-12                          Administrative actions and
                                      permission changes shall be
                                      auditable.
  -----------------------------------------------------------------------

### 6.3 Reliability and availability

-   The system should recover gracefully from temporary service
    failures.
-   Failed judging-service requests shall produce a clear status and
    shall not corrupt submission records.
-   Database backups shall be scheduled and restoration shall be tested.
-   Critical errors shall be logged with correlation identifiers.
-   The platform should target 99.5% monthly availability after
    production launch, excluding announced maintenance and external
    provider outages. This is a target, not a guarantee.

### 6.4 Usability

-   Common tasks shall have clear navigation and understandable
    instructions.
-   Forms shall explain validation errors near the relevant fields.
-   The coding workspace shall clearly distinguish source code, input,
    output and judging status.
-   Destructive actions shall require confirmation where appropriate.
-   New users should be able to understand how to ask a question and
    submit a solution without external instructions.

### 6.5 Accessibility

-   The UI should follow WCAG 2.2 AA guidance where practical.
-   Interactive elements shall be keyboard accessible.
-   Text and controls shall have sufficient contrast.
-   Forms shall have associated labels.
-   Status shall not be communicated by colour alone.
-   Images shall have appropriate alternative text.

### 6.6 Maintainability

-   Frontend, backend, database and judge integration code shall be
    separated into clear modules.
-   The codebase shall use consistent naming and formatting conventions.
-   APIs and important business rules shall be documented.
-   Automated tests shall cover critical functionality.
-   Database changes shall be managed through versioned migrations.
-   Configuration shall differ safely between development, testing and
    production.

### 6.7 Scalability

-   Stateless backend instances should be deployable behind a load
    balancer.
-   Long-running judging tasks should be handled by workers or a
    separate service.
-   Caching may be introduced for frequently requested public data.
-   Database indexes and query performance shall be monitored.
-   File uploads should use controlled object storage rather than
    unrestricted local paths.

### 6.8 Compatibility

The application shall support current stable versions of major browsers,
including Chrome, Firefox, Edge and Safari, subject to testing. The
layout shall adapt to common mobile and desktop viewports.

------------------------------------------------------------------------

## 7. System architecture

### 7.1 Proposed architecture

``` mermaid
flowchart TD
    U[User Browser] --> F[React Frontend]
    F -->|HTTPS REST API| B[Flask Backend]
    B --> DB[(MySQL Database)]
    B --> Q[Submission Queue]
    Q --> J[Isolated Judge Service]
    J --> R[Execution Result]
    R --> B
    B --> N[Notification / Email Service]
    B --> S[Object Storage]
    A[Admin / Moderator] --> F
```

### 7.2 Component responsibilities

**Frontend -- React** - Displays pages and reusable UI components. -
Handles navigation and form interactions. - Communicates with backend
APIs. - Displays coding editor and submission results. - Does not make
final authorization decisions.

**Backend -- Flask** - Implements business rules. - Authenticates users
and checks permissions. - Validates and stores user data. - Exposes REST
APIs. - Creates and tracks code submissions. - Integrates with
notification and judging services.

**Database -- MySQL** - Stores accounts, content, problems, submissions
and progress. - Enforces relational integrity. - Supports queries,
indexes and transactions.

**Judge service** - Accepts authorized submission jobs. - Executes code
in an isolated environment. - Applies time, memory and output limits. -
Compares output with expected results. - Returns a controlled result to
the backend.

### 7.3 Suggested backend modules

-   `auth` -- registration, login and account security.
-   `users` -- profiles and user settings.
-   `community` -- questions, answers, comments and votes.
-   `problems` -- problem library, tags and test cases.
-   `submissions` -- submission records and judging workflow.
-   `progress` -- solved status, points and achievements.
-   `notifications` -- in-app notifications.
-   `moderation` -- reports and content review.
-   `admin` -- administrative operations.
-   `common` -- shared validation, errors, permissions and utilities.

------------------------------------------------------------------------

## 8. High-level page structure

### 8.1 Public pages

  -----------------------------------------------------------------------
  Page                                Main contents
  ----------------------------------- -----------------------------------
  Landing page                        Product introduction, feature
                                      overview and calls to action

  Login                               Account authentication

  Registration                        New account creation

  Community feed                      Public questions and discussions

  Question detail                     Question, answers, comments and
                                      voting

  Problem library                     Searchable coding problems

  Problem detail                      Problem statement, constraints and
                                      examples

  Public profile                      Public developer information and
                                      activity

  Leaderboard                         Public rankings
  -----------------------------------------------------------------------

### 8.2 Authenticated pages

  Page                 Main contents
  -------------------- ----------------------------------------------------
  User dashboard       Progress summary and recent activity
  Ask question         Question editor, tags and preview
  Edit question        Update owned question
  Coding workspace     Problem description, editor and results
  Submission history   User's submissions and judging outcomes
  Notifications        User alerts
  Account settings     Profile, security and preferences
  Saved items          Bookmarked problems or discussions, if implemented

### 8.3 Administrative pages

  Page                 Main contents
  -------------------- ---------------------------------------------
  Admin dashboard      Platform summary and operational indicators
  User management      Account status and role management
  Content moderation   Reports and moderation actions
  Problem management   Create, edit, publish and archive problems
  Tag management       Create and maintain categories
  Audit log            Review sensitive administrative actions

### 8.4 Primary navigation

The main navigation should provide access to:

-   Home
-   Community
-   Problems
-   Leaderboard
-   Dashboard
-   Profile

Administrative navigation shall only be visible to authorized staff.

------------------------------------------------------------------------

## 9. Key workflows

### 9.1 Registration workflow

1.  Visitor opens the registration page.
2.  Visitor enters required account information.
3.  Frontend performs basic validation.
4.  Backend validates the request and checks uniqueness.
5.  Backend securely hashes the password.
6.  Account is created.
7.  If email verification is enabled, a verification message is sent.
8.  User signs in after satisfying the account policy.

### 9.2 Ask and answer workflow

1.  Registered user opens the question editor.
2.  User enters a title, description and tags.
3.  Backend validates and stores the question.
4.  Other users discover and open the question.
5.  An authenticated user submits an answer.
6.  Users may comment and vote.
7.  The question owner may accept an answer.
8.  Relevant participants receive notifications if enabled.

### 9.3 Code submission workflow

1.  User opens a coding problem.
2.  User selects an enabled programming language.
3.  User writes source code in the editor.
4.  User submits the code.
5.  Backend authenticates the user and validates the problem and
    language.
6.  Backend stores a submission record with a pending status.
7.  A job is sent to the isolated judge service.
8.  The judge executes the code against permitted test cases.
9.  The judge returns a controlled result.
10. Backend updates the submission status and progress.
11. Frontend displays the result to the user.

### 9.4 Moderation workflow

1.  A user reports content.
2.  The system records the report and target content.
3.  A moderator reviews the report.
4.  The moderator dismisses the report or takes an allowed action.
5.  The system records the action in an audit log.
6.  Relevant users are notified where appropriate.

------------------------------------------------------------------------

## 10. Code execution safety requirements

Code execution is a high-risk part of SCRIPTORIUM and requires separate
security design.

The platform shall:

-   Never execute untrusted code in the Flask web process.
-   Use a dedicated judge service or reputable code-execution provider.
-   Run each job in a disposable, isolated environment.
-   Apply CPU, memory, process, time and output limits.
-   Restrict filesystem access and disable unnecessary privileges.
-   Restrict outbound network access by default.
-   Prevent one user's job from accessing another user's files or data.
-   Keep private test cases inaccessible to users.
-   Validate the requested language against an allowlist.
-   Authenticate backend-to-judge requests.
-   Record job status and handle timeouts and service failures.
-   Avoid returning internal paths, secrets or infrastructure details in
    error messages.

The exact sandbox technology and deployment model must be selected and
threat-modelled before enabling public code execution.

------------------------------------------------------------------------

## 11. Testing requirements

### 11.1 Testing levels

**Unit testing** - Test individual functions and business rules. - Test
validation and scoring logic. - Test permission checks.

**Integration testing** - Test API-to-database operations. - Test
authentication flows. - Test backend-to-judge communication. - Test
notification delivery.

**System testing** - Test complete user journeys. - Test responsive
behaviour. - Test submission and result workflows. - Test administrative
workflows.

**Security testing** - Test unauthorized access and role escalation. -
Test input validation and common web vulnerabilities. - Test rate limits
and session handling. - Test code-execution isolation and resource
limits.

**Performance testing** - Test common API operations under
representative load. - Test concurrent submissions. - Test pagination
and database query performance.

### 11.2 Acceptance criteria

The initial release may be considered acceptable when:

1.  A user can register, log in and manage their permitted profile
    details.
2.  Public users can browse public questions and problems.
3.  Registered users can create questions and submit answers.
4.  Voting and accepted-answer rules work correctly.
5.  Users can browse problems and submit code in at least one configured
    language.
6.  Code runs only through the isolated judge service.
7.  Submission results are saved and visible to the submitting user.
8.  User progress is updated correctly after accepted solutions.
9.  Unauthorized users cannot access protected or administrative
    operations.
10. Moderators can review and act on reports.
11. Critical workflows pass automated and manual tests.
12. Backup and restoration procedures have been tested before production
    use.

------------------------------------------------------------------------

## 12. Deployment and maintenance

### 12.1 Environments

The project should maintain separate environments:

-   **Development:** Local implementation and debugging.
-   **Testing/Staging:** Integration and acceptance testing.
-   **Production:** Live service for actual users.

### 12.2 Deployment requirements

-   Use environment-specific configuration.
-   Store secrets in a secure secret-management facility.
-   Use HTTPS in production.
-   Apply database migrations in a controlled manner.
-   Configure application and judge-service logging.
-   Configure database backups and verify restoration.
-   Monitor service health, errors and resource use.
-   Keep dependencies and runtime environments maintained.

### 12.3 Maintenance

Maintenance activities should include:

-   Security updates.
-   Dependency updates.
-   Database backup verification.
-   Log and error review.
-   Performance monitoring.
-   Moderation-policy review.
-   User feedback collection.
-   Compatibility testing after major changes.

------------------------------------------------------------------------

## 13. Project scope and release plan

### 13.1 MVP -- Minimum Viable Product

The first usable release should include:

-   Registration, login and user profiles.
-   Community questions and answers.
-   Tags, comments and voting.
-   Coding problem library.
-   Basic code editor.
-   Secure judge integration for at least one language.
-   Submission history and results.
-   Basic progress dashboard.
-   Basic administrator and moderation tools.

### 13.2 Release 2 -- Community and learning improvements

-   Multiple programming languages.
-   Notifications.
-   Bookmarks and saved problems.
-   Leaderboards and points.
-   Badges and achievements.
-   Better search and filtering.
-   Problem-setter workflow.

### 13.3 Release 3 -- Advanced platform

-   Timed contests.
-   Code battles.
-   Study groups.
-   AI-assisted code explanations.
-   Personalized recommendations.
-   More detailed analytics.
-   Real-time features where justified.

### 13.4 Out of scope for the initial release

-   Native Android or iOS applications.
-   Payment processing and paid subscriptions.
-   A public cloud IDE for arbitrary long-running applications.
-   Unrestricted terminal or shell access.
-   Production-scale social networking features.
-   Guaranteed plagiarism detection.
-   AI-generated evaluation as a replacement for deterministic test
    cases.

------------------------------------------------------------------------

## 14. Risks and mitigations

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Unsafe code execution   Critical security       Isolated judge, strict
                          compromise              resource limits and
                                                  security testing

  Unauthorized access     Exposure or             Server-side RBAC,
                          modification of data    ownership checks and
                                                  audit logs

  Spam and abusive        Poor community          Reporting, moderation,
  content                 experience              rate limits and clear
                                                  community rules

  Judge service outage    Submissions cannot be   Queue jobs, retries,
                          evaluated               clear status and health
                                                  monitoring

  Database performance    Slow pages and API      Indexing, pagination,
  issues                  failures                query analysis and load
                                                  testing

  Project scope becomes   Delayed completion      Build MVP first and
  too large                                       deliver in milestones

  Data loss               Loss of user and        Automated backups and
                          project data            tested restoration

  Third-party dependency  Integration failures    Version pinning,
  changes                                         monitoring and fallback
                                                  planning
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 15. Traceability and requirement management

Each requirement identifier should be linked to:

-   A design component or API endpoint.
-   One or more implementation tasks.
-   One or more test cases.
-   Its release milestone.
-   Its completion status.

Suggested tracking states:

-   Proposed
-   Approved
-   In development
-   Implemented
-   Tested
-   Deferred

Requirements should be updated when the project scope or technical
decisions change. Changes affecting security, privacy, data
relationships or code execution should receive particular review.

------------------------------------------------------------------------

## 16. Open decisions

The following decisions should be finalized during technical design:

1.  Whether authentication will use secure server sessions or a
    token-based approach.
2.  Which code editor library will be integrated.
3.  Which judge service or sandbox technology will be used.
4.  Which programming languages will be enabled in the first release.
5.  Whether email verification is mandatory.
6.  Which hosting provider and deployment architecture will be selected.
7.  Whether uploaded profile images will use object storage.
8.  The exact points, badge and leaderboard scoring policy.
9.  Data retention and account deletion policy.
10. The moderation and community guidelines.

------------------------------------------------------------------------

## 17. Approval

This SRS is the initial requirements baseline for SCRIPTORIUM.
Implementation should begin after the MVP requirements, architecture
decisions and code-execution safety approach have been reviewed.

  Role                 Name              Approval / date
  -------------------- ----------------- -----------------
  Project developer    To be completed   Pending
  Project supervisor   To be completed   Pending
  Reviewer             To be completed   Pending

------------------------------------------------------------------------

**End of SRS -- SCRIPTORIUM, Version 1.0**
