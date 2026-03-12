export const initialCourses = [
  {
    id: "cs101",
    code: "CS101",
    sectionNumber: "001",
    title: "Intro to Computer Science",
    credits: 4,
    description: "Fundamental concepts of programming, algorithms, and data structures using Python.",
    prereqsMet: true,
    schedule: "Mon/Wed 10:00 AM",
    instructor: "Dr. Alan Smith",
    seatsInfo: "24/40 Seats Left",
    department: "Computer Science",
    type: "Core",
    alertText: null
  },
  {
    id: "math201",
    code: "MATH201",
    title: "Calculus II",
    sectionNumber: "002",

    credits: 3,
    description: "Advanced integration techniques, infinite series, and parametric equations.",
    prereqsMet: false,
    schedule: "Tue/Thu 2:00 PM",
    instructor: "Dr. Emily Chen",
    seatsInfo: "Only 3 Seats Left!",
    department: "Mathematics",
    type: "Core",
    alertText: "Only 3 Seats Left!"
  },
  {
    id: "phys101",
    code: "PHYS101",
    title: "General Physics",
    sectionNumber: "003",
    credits: 4,
    description: "Mechanics, heat, and sound. Includes laboratory sessions.",
    prereqsMet: true,
    schedule: "Mon/Wed 1:00 PM",
    instructor: "Dr. Robert Lee",
    seatsInfo: "Waitlist Only (5)",
    department: "Physics",
    type: "Core",
    alertText: null
  },
  {
    id: "eng102",
    code: "ENG102",
    title: "Advanced Composition",
    sectionNumber: "004",
      credits: 3,
    description: "Focus on persuasive writing and research methodologies.",
    prereqsMet: true,
    schedule: "Fri 9:00 AM",
    instructor: "Prof. Sarah James",
    seatsInfo: "15/25 Seats Left",
    department: "Humanities",
    type: "Electives",
    alertText: null
  }
];