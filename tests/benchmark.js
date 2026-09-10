function runBenchmark() {
  const hrefs = [
    '/about/',
    '/work/',
    '/projects/tornado-tracker/',
    '/creations',
    'index.html',
    '../',
    '../../',
    'https://github.com/cyork95',
    '/'
  ];

  function oldGetHrefSegment(href) {
    return href.replace(/^\//, '').replace(/\/$/, '').split('/')[0];
  }

  function newGetHrefSegment(href) {
    const start = href.startsWith('/') ? 1 : 0;
    let end = href.indexOf('/', start);
    if (end === -1) end = href.length;
    return href.slice(start, end);
  }

  // Check equality
  for (const href of hrefs) {
    const oldRes = oldGetHrefSegment(href);
    const newRes = newGetHrefSegment(href);
    if (oldRes !== newRes) {
      console.error(`Mismatch for href '${href}': old='${oldRes}', new='${newRes}'`);
      process.exit(1);
    }
  }
  console.log('✓ All segment parsing outputs match perfectly!');

  // Measure pure segment parsing
  const iterations = 5_000_000;

  const startOld = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    for (const href of hrefs) {
      oldGetHrefSegment(href);
    }
  }
  const endOld = process.hrtime.bigint();
  const oldTimeMs = Number(endOld - startOld) / 1e6;

  const startNew = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    for (const href of hrefs) {
      newGetHrefSegment(href);
    }
  }
  const endNew = process.hrtime.bigint();
  const newTimeMs = Number(endNew - startNew) / 1e6;

  console.log(`\n--- Pure Segment Parsing Benchmark (${iterations} iterations x ${hrefs.length} hrefs) ---`);
  console.log(`Baseline (Regex .replace): ${oldTimeMs.toFixed(2)} ms`);
  console.log(`Optimized (String slice):  ${newTimeMs.toFixed(2)} ms`);
  console.log(`Speedup factor: ${(oldTimeMs / newTimeMs).toFixed(2)}x faster (${((1 - newTimeMs / oldTimeMs) * 100).toFixed(2)}% reduction in execution time)`);
}

runBenchmark();
