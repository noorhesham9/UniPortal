const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("./models/User");
const Role = require("./models/Role");
const Department = require("./models/Department");

dotenv.config({ path: path.join(__dirname, "config.env") });

// Helper function to generate random GPA between 0.8 and 4.1
const randomGPA = () => {
  return parseFloat((Math.random() * (4.1 - 0.8) + 0.8).toFixed(2));
};

const seedStudents = async () => {
  try {
    console.log("Starting student seed...");

    // Get student role
    const studentRole = await Role.findOne({ name: "student" });
    if (!studentRole) {
      console.error("Student role not found! Please run the main seed first.");
      return;
    }

    // Get departments
    const mathCSDept = await Department.findOne({ code: "MATH-CS" });
    const csDept = await Department.findOne({ code: "CS" });
    const mathDept = await Department.findOne({ code: "MATH" });

    if (!mathCSDept || !csDept || !mathDept) {
      console.error("Departments not found! Please run the main seed first.");
      return;
    }

    const students = [];
    let studentCounter = 1000; // Start from STU-2025-1000
    const departments = [mathCSDept, csDept, mathDept];

    // Generate 500 first grade students (no department)
    console.log("Generating 500 first grade students (no department)...");
    for (let i = 0; i < 500; i++) {
      const studentId = `STU-2025-${String(studentCounter++).padStart(4, "0")}`;
      const firebaseUid = `student_level1_${studentId}_${Date.now()}`;

      students.push({
        firebaseUid,
        name: `Student Level 1 - ${i + 1}`,
        email: `student.l1.${i + 1}@university.edu`,
        studentId,
        role: studentRole._id,
        level: "1",
        gpa: randomGPA(),
        is_active: true,
        isStudent: true,
        feesPaid: true,
        department: null, // No department for first grade
      });
    }

    // Generate 500 second grade students (with department, 36+ credits)
    console.log("Generating 500 second grade students (with department)...");
    for (let i = 0; i < 500; i++) {
      const studentId = `STU-2025-${String(studentCounter++).padStart(4, "0")}`;
      const firebaseUid = `student_level2_${studentId}_${Date.now()}`;
      const dept = departments[i % 3]; // Distribute evenly

      students.push({
        firebaseUid,
        name: `Student Level 2 - ${i + 1}`,
        email: `student.l2.${i + 1}@university.edu`,
        studentId,
        role: studentRole._id,
        department: dept._id,
        level: "2",
        gpa: randomGPA(),
        is_active: true,
        isStudent: true,
        feesPaid: true,
      });
    }

    // Generate 500 third grade students (with department, 66+ credits)
    console.log("Generating 500 third grade students (with department)...");
    for (let i = 0; i < 500; i++) {
      const studentId = `STU-2025-${String(studentCounter++).padStart(4, "0")}`;
      const firebaseUid = `student_level3_${studentId}_${Date.now()}`;
      const dept = departments[i % 3];

      students.push({
        firebaseUid,
        name: `Student Level 3 - ${i + 1}`,
        email: `student.l3.${i + 1}@university.edu`,
        studentId,
        role: studentRole._id,
        department: dept._id,
        level: "3",
        gpa: randomGPA(),
        is_active: true,
        isStudent: true,
        feesPaid: true,
      });
    }

    // Generate 500 fourth grade students (with department, 96+ credits)
    console.log("Generating 500 fourth grade students (with department)...");
    for (let i = 0; i < 500; i++) {
      const studentId = `STU-2025-${String(studentCounter++).padStart(4, "0")}`;
      const firebaseUid = `student_level4_${studentId}_${Date.now()}`;
      const dept = departments[i % 3];

      students.push({
        firebaseUid,
        name: `Student Level 4 - ${i + 1}`,
        email: `student.l4.${i + 1}@university.edu`,
        studentId,
        role: studentRole._id,
        department: dept._id,
        level: "4",
        gpa: randomGPA(),
        is_active: true,
        isStudent: true,
        feesPaid: true,
      });
    }

    // Insert students in batches
    console.log(`\nInserting ${students.length} students into database...`);
    const insertedStudents = await User.insertMany(students);
    console.log(`✓ ${insertedStudents.length} students created successfully!`);

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║                    SEED SUMMARY                        ║");
    console.log("╠════════════════════════════════════════════════════════╣");
    console.log(
      `║ Total students created: ${insertedStudents.length.toString().padEnd(30)}║`,
    );
    console.log("║                                                        ║");
    console.log("║ Distribution by Level:                                 ║");
    console.log("║  • Level 1 (no department, 0 credits):     500         ║");
    console.log("║  • Level 2 (with department, 36+ credits): 500         ║");
    console.log("║  • Level 3 (with department, 66+ credits): 500         ║");
    console.log("║  • Level 4 (with department, 96+ credits): 500         ║");
    console.log("║                                                        ║");
    console.log("║ GPA Range: 0.8 - 4.1 (randomly assigned)               ║");
    console.log("║                                                        ║");
    console.log("║ Student ID Range:                                      ║");
    console.log("║  STU-2025-1000 to STU-2025-2999                        ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log("\n✓ Student seed completed successfully!");
  } catch (error) {
    console.error("✗ Error seeding students:", error);
    throw error;
  }
};

// Connect to database and run seed
const dbName =
  process.env.NODE_ENV === "production" ? "UNIPortal" : "UNIPortalDEV";

mongoose
  .connect(process.env.CONN_STR, { dbName })
  .then(async () => {
    console.log("✓ DB Connection Successful\n");
    await seedStudents();
    process.exit(0);
  })
  .catch((err) => {
    console.error("✗ DB Connection failed:", err.message);
    process.exit(1);
  });
