// Seed semesters from 2022 to 2026 (3 terms per year)
// Run: node seedSemesters.js

require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const Semester = require("./models/Semester");

const semesters = [];

// Generate semesters from 2022 to 2026
for (let year = 2022; year <= 2026; year++) {
  // Fall Semester (September - December)
  semesters.push({
    year,
    term: "Fall",
    is_active: year === 2025 && "Fall" === "Spring", // Make Spring 2025 active
    start_date: new Date(`${year}-09-01`),
    end_date: new Date(`${year}-12-20`),
    add_drop_start: new Date(`${year}-08-25`),
    add_drop_end: new Date(`${year}-09-15`),
    show_final_results: year < 2025, // Show results for past semesters
  });

  // Spring Semester (February - May)
  semesters.push({
    year,
    term: "Spring",
    is_active: year === 2025 && "Spring" === "Spring", // Make Spring 2025 active
    start_date: new Date(`${year}-02-01`),
    end_date: new Date(`${year}-05-25`),
    add_drop_start: new Date(`${year}-01-25`),
    add_drop_end: new Date(`${year}-02-15`),
    show_final_results: year < 2025 || (year === 2025 && "Spring" !== "Spring"), // Show results for past semesters
  });

  // Summer Semester (June - August)
  semesters.push({
    year,
    term: "Summer",
    is_active: false, // Summer is never active by default
    start_date: new Date(`${year}-06-01`),
    end_date: new Date(`${year}-08-20`),
    add_drop_start: new Date(`${year}-05-25`),
    add_drop_end: new Date(`${year}-06-10`),
    show_final_results: year < 2025, // Show results for past semesters
  });
}

async function seedSemesters() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing semesters
    const count = await Semester.countDocuments();
    console.log(`📋 Found ${count} existing semesters`);

    const answer = "yes"; // Auto-confirm for script
    if (answer.toLowerCase() === "yes") {
      await Semester.deleteMany({});
      console.log("🗑️  Deleted all existing semesters\n");
    }

    // Insert new semesters
    const inserted = await Semester.insertMany(semesters);
    console.log(`✅ Created ${inserted.length} semesters\n`);

    // Show summary
    console.log("📊 Summary:");
    console.log("─".repeat(60));

    for (let year = 2022; year <= 2026; year++) {
      const yearSems = inserted.filter((s) => s.year === year);
      console.log(`\n${year}:`);
      yearSems.forEach((s) => {
        const active = s.is_active ? "🟢 ACTIVE" : "";
        const results = s.show_final_results ? "📊 Results Visible" : "";
        console.log(
          `  ${s.term.padEnd(8)} | ${s.start_date.toLocaleDateString()} - ${s.end_date.toLocaleDateString()} ${active} ${results}`,
        );
      });
    }

    console.log("\n" + "─".repeat(60));
    console.log("\n✅ Done! You can now import this data to MongoDB Atlas.");
    console.log("\n💡 To export for Atlas:");
    console.log(
      "   mongoexport --db=your_db --collection=semesters --out=semesters.json",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedSemesters();
