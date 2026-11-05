import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sliders,
  Sparkles,
  Layers,
  Activity,
  GitBranch,
  BarChart2,
  TreePine,
  Info
} from 'lucide-react';
import { Button } from '../components/common/Button';

type AlgorithmType = 'bubble' | 'insertion' | 'selection' | 'quick' | 'bfs' | 'bst';

interface StepState {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  description: string;
}

export const DsaVisualizerPage: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>('bubble');
  const [arraySize, setArraySize] = useState<number>(18);
  const [speedMs, setSpeedMs] = useState<number>(300);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Sorting Animation Steps
  const [steps, setSteps] = useState<StepState[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // BST State
  const [bstValue, setBstValue] = useState<string>('25');
  const [bstNodes, setBstNodes] = useState<number[]>([50, 30, 70, 20, 40, 60, 80]);
  const [bstActivePath, setBstActivePath] = useState<number[]>([]);

  // Timer Ref
  const timerRef = useRef<any>(null);

  // Generate a random array
  const generateRandomArray = (size = arraySize): number[] => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 10);
  };

  const [currentArray, setCurrentArray] = useState<number[]>(() => generateRandomArray(18));

  // Generate steps based on selected algorithm
  const generateSteps = (algo: AlgorithmType, arr: number[]) => {
    const recordedSteps: StepState[] = [];
    const a = [...arr];

    recordedSteps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      description: 'Initial randomized dataset loaded.',
    });

    if (algo === 'bubble') {
      const n = a.length;
      const sortedIndices: number[] = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          recordedSteps.push({
            array: [...a],
            comparing: [j, j + 1],
            swapping: [],
            sorted: [...sortedIndices],
            description: `Comparing elements: ${a[j]} and ${a[j + 1]}`,
          });
          if (a[j] > a[j + 1]) {
            recordedSteps.push({
              array: [...a],
              comparing: [],
              swapping: [j, j + 1],
              sorted: [...sortedIndices],
              description: `Swapping ${a[j]} > ${a[j + 1]} to maintain ascending order`,
            });
            const temp = a[j];
            a[j] = a[j + 1];
            a[j + 1] = temp;
          }
        }
        sortedIndices.push(n - i - 1);
      }
      recordedSteps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i),
        description: 'Bubble sort complete! Entire array is sorted.',
      });
    } else if (algo === 'selection') {
      const n = a.length;
      const sortedIndices: number[] = [];
      for (let i = 0; i < n; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          recordedSteps.push({
            array: [...a],
            comparing: [minIdx, j],
            swapping: [],
            sorted: [...sortedIndices],
            description: `Scanning index ${j} (${a[j]}). Current minimum at index ${minIdx} (${a[minIdx]})`,
          });
          if (a[j] < a[minIdx]) {
            minIdx = j;
          }
        }
        if (minIdx !== i) {
          recordedSteps.push({
            array: [...a],
            comparing: [],
            swapping: [i, minIdx],
            sorted: [...sortedIndices],
            description: `Swapping minimum element ${a[minIdx]} into position ${i}`,
          });
          const temp = a[i];
          a[i] = a[minIdx];
          a[minIdx] = temp;
        }
        sortedIndices.push(i);
      }
      recordedSteps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i),
        description: 'Selection sort complete!',
      });
    } else if (algo === 'insertion') {
      const n = a.length;
      for (let i = 1; i < n; i++) {
        let key = a[i];
        let j = i - 1;
        recordedSteps.push({
          array: [...a],
          comparing: [i, j],
          swapping: [],
          sorted: Array.from({ length: i }, (_, idx) => idx),
          description: `Picking key element ${key} at index ${i} to insert into sorted prefix`,
        });
        while (j >= 0 && a[j] > key) {
          recordedSteps.push({
            array: [...a],
            comparing: [j, j + 1],
            swapping: [j, j + 1],
            sorted: [],
            description: `Shifting ${a[j]} one position right because it is greater than ${key}`,
          });
          a[j + 1] = a[j];
          j = j - 1;
        }
        a[j + 1] = key;
      }
      recordedSteps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i),
        description: 'Insertion sort complete!',
      });
    }

    setSteps(recordedSteps);
    setCurrentStepIndex(0);
  };

  const handleReset = () => {
    setIsPlaying(false);
    clearInterval(timerRef.current);
    const newArr = generateRandomArray(arraySize);
    setCurrentArray(newArr);
    generateSteps(selectedAlgo, newArr);
  };

  useEffect(() => {
    handleReset();
  }, [selectedAlgo, arraySize]);

  // Animation Loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            return prev;
          }
        });
      }, speedMs);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps.length, speedMs]);

  const currentStep = steps[currentStepIndex] || {
    array: currentArray,
    comparing: [],
    swapping: [],
    sorted: [],
    description: '',
  };

  // BST Search Animation
  const handleBstSearch = () => {
    const target = parseInt(bstValue, 10);
    if (isNaN(target)) return;
    const path: number[] = [];
    let current = 0; // index in fixed tree array

    // Binary search in sorted array simulator
    const sortedTree = [...bstNodes].sort((a, b) => a - b);
    let low = 0;
    let high = sortedTree.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      path.push(sortedTree[mid]);
      if (sortedTree[mid] === target) break;
      if (sortedTree[mid] < target) low = mid + 1;
      else high = mid - 1;
    }
    setBstActivePath(path);
  };

  const handleBstInsert = () => {
    const val = parseInt(bstValue, 10);
    if (!isNaN(val) && !bstNodes.includes(val)) {
      setBstNodes(prev => [...prev, val]);
      setBstValue('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Visualizer Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Interactive Lab
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500">Step-by-Step Algorithm State Engine</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Interactive DSA Visualizer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Observe memory invariants, element comparisons, recursion boundaries, and pointer swaps in real-time.
          </p>
        </div>

        {/* Algorithm Type Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
          {[
            { id: 'bubble', label: 'Bubble Sort' },
            { id: 'selection', label: 'Selection Sort' },
            { id: 'insertion', label: 'Insertion Sort' },
            { id: 'bst', label: 'Binary Search Tree' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedAlgo(tab.id as AlgorithmType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedAlgo === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {selectedAlgo !== 'bst' ? (
        /* Sorting Visualizer Workspace */
        <div className="space-y-6">
          {/* Main Visualizer Stage */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 space-y-8">
            {/* Visualizer Bars Container */}
            <div className="h-72 sm:h-80 flex items-end justify-center gap-2 sm:gap-3 px-2 pt-6 border-b border-slate-100 dark:border-slate-800">
              {currentStep.array.map((value, idx) => {
                const isComparing = currentStep.comparing.includes(idx);
                const isSwapping = currentStep.swapping.includes(idx);
                const isSorted = currentStep.sorted.includes(idx);

                let barColor = 'bg-slate-400 dark:bg-slate-600';
                if (isSorted) barColor = 'bg-emerald-500';
                else if (isSwapping) barColor = 'bg-rose-500 animate-pulse';
                else if (isComparing) barColor = 'bg-amber-400';

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-500">
                      {value}
                    </span>
                    <div
                      style={{ height: `${(value / 100) * 100}%` }}
                      className={`w-full rounded-t-lg transition-all duration-150 ${barColor}`}
                    />
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                      {idx}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Invariant Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-md bg-slate-400 dark:bg-slate-600" />
                <span>Unsorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-md bg-amber-400" />
                <span>Active Comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-md bg-rose-500" />
                <span>Swapping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
                <span>In-Place Sorted</span>
              </div>
            </div>

            {/* Step Explanation Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {currentStep.description || 'Ready to start animation.'}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap ml-4">
                Step {currentStepIndex + 1} / {steps.length || 1}
              </span>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(prev => Math.max(0, prev - 1));
                  }}
                  disabled={currentStepIndex <= 0}
                >
                  <SkipBack className="w-4 h-4 mr-1" />
                  Prev
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-28 text-white font-semibold ${
                    isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-1.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1.5 fill-white" /> Play
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1));
                  }}
                  disabled={currentStepIndex >= steps.length - 1}
                >
                  Next
                  <SkipForward className="w-4 h-4 ml-1" />
                </Button>

                <Button size="sm" variant="ghost" onClick={handleReset} title="Generate new dataset">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Randomize
                </Button>
              </div>

              {/* Sliders: Speed & Array Size */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Size: {arraySize}</span>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={arraySize}
                    onChange={e => setArraySize(Number(e.target.value))}
                    disabled={isPlaying}
                    className="w-24 accent-indigo-600"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span>Speed:</span>
                  <select
                    value={speedMs}
                    onChange={e => setSpeedMs(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  >
                    <option value={600}>0.5x</option>
                    <option value={300}>1.0x</option>
                    <option value={120}>2.5x</option>
                    <option value={40}>5.0x</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Binary Search Tree (BST) Workspace */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TreePine className="w-5 h-5 text-emerald-500" />
                Binary Search Tree (BST) & Search Path
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                BST Property: Every node to the left is smaller; every node to the right is larger.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Value..."
                value={bstValue}
                onChange={e => setBstValue(e.target.value)}
                className="w-28 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
              <Button size="sm" onClick={handleBstSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                Search
              </Button>
              <Button size="sm" variant="outline" onClick={handleBstInsert} className="text-xs">
                Insert
              </Button>
            </div>
          </div>

          {/* Node Representation */}
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <div className="text-xs font-semibold text-slate-400">
              Active Elements in Tree:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[...bstNodes].sort((a, b) => a - b).map(n => {
                const isInPath = bstActivePath.includes(n);
                return (
                  <div
                    key={n}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm shadow-xs transition duration-300 ${
                      isInPath
                        ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {n}
                  </div>
                );
              })}
            </div>

            {bstActivePath.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs">
                <strong>Traversal Path Visited:</strong> {bstActivePath.join(' → ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DsaVisualizerPage;
