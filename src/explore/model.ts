export const entries = [
  {
    id: 'algorithms',
    title: 'Algorithms',
    question: 'What moves, and why?',
    href: '#/algorithms/sorting',
    description: 'Compare seven sorting algorithms. Follow their decisions, then read the code.',
    links: [
      { title: 'Selection sort', href: '#/algorithms/selection/understand' },
      { title: 'Shell sort', href: '#/algorithms/shell/play' },
      { title: 'All sorting algorithms', href: '#/algorithms/sorting' },
    ],
  },
  {
    id: 'discrete',
    title: 'Discrete mathematics',
    question: 'Why does it work?',
    href: '#/discrete',
    description: 'Prove a pattern, cancel a sum, or find the work in a recursion tree.',
    links: [
      { title: 'Induction', href: '#/discrete/induction' },
      { title: 'Telescoping', href: '#/discrete/telescoping' },
      { title: 'Master theorem', href: '#/discrete/master-theorem' },
    ],
  },
  {
    id: 'complexity',
    title: 'Complexity',
    question: 'How do growth rates compare?',
    href: '#/complexity',
    description: 'Understand asymptotic bounds first, then analyze algorithm time and memory.',
    links: [
      { title: 'Asymptotic bounds', href: '#/complexity/asymptotic' },
      { title: 'Time', href: '#/complexity/time' },
      { title: 'Space', href: '#/complexity/space' },
    ],
  },
];
export const resources = [
  {
    title: 'AlgoMaster',
    href: 'https://algomaster.io/learn/dsa/course-introduction',
    use: 'Structured DSA explanations and interview-preparation topics.',
    access: 'Free content + paid Premium',
    details: 'https://algomaster.io/premium',
  },
  {
    title: 'NeetCode',
    href: 'https://neetcode.io/practice',
    use: 'Practice problems, solution explanations, and coding-interview preparation.',
    access: 'Free practice + paid Pro',
    details: 'https://neetcode.io/pro',
  },
  {
    title: 'Hello Interview',
    href: 'https://www.hellointerview.com/',
    use: 'Job-interview preparation for FAANG and other major tech companies: coding, system design, and behavioral interviews. Complements DSA fundamentals with a hiring-focused approach.',
    access: 'Free learning content + paid Premium',
    details: 'https://www.hellointerview.com/pricing',
  },
  {
    title: 'MIT · Introduction to Algorithms',
    href: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
    use: 'Lectures, notes, and practice problems for deeper algorithm analysis.',
    access: 'Free course materials',
  },
  {
    title: 'MIT · Mathematics for Computer Science',
    href: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/',
    use: 'Proofs, induction, sums, recurrences, and an open textbook.',
    access: 'Free course materials',
  },
];
