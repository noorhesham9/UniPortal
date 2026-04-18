const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'UNIPortalDEV' }).then(async () => {
  const Section = require('./models/Section');
  const Semester = require('./models/Semester');
  const Course = require('./models/course.model');
  const User = require('./models/User');
  
  const activeSem = await Semester.findOne({ is_active: true });
  console.log('Active Semester:', activeSem?._id, activeSem?.term, activeSem?.year);
  
  const sections = await Section.find({ semester_id: activeSem?._id });
  console.log('Sections in active semester:', sections.length);
  if (sections.length > 0) {
    console.log('Sample section course_id:', sections[0].course_id);
  }
  
  const hesham = await User.findOne({ email: 'heshamabdallah@gmail.com' }).lean();
  console.log('Hesham level:', hesham?.level, '| dept:', hesham?.department);
  
  if (hesham) {
    const userLevel = Number(hesham.level) || 1;
    
    // Check sample courses to see their min_level values
    const sampleCourses = await Course.find({ is_activated: true }).limit(5).lean();
    console.log('Sample courses:');
    sampleCourses.forEach(c => console.log(' -', c.code, '| min_level:', c.min_level, '| dept:', c.department));
    
    // Try without level filter
    const coursesNoDeptFilter = await Course.find({ 
      is_activated: true,
      $or: [{ department: null }, { department: hesham.department }]
    }).lean();
    console.log('Courses matching dept (no level filter):', coursesNoDeptFilter.length);
    
    // Try without any filter
    const allCourses = await Course.find({ is_activated: true }).lean();
    console.log('All activated courses:', allCourses.length);
    console.log('min_level values:', [...new Set(allCourses.map(c => c.min_level))]);
  }
  
  mongoose.disconnect();
}).catch(e => console.error(e.message));
