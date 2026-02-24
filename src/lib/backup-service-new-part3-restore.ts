// PART 3: Restore Methods for NEW Web Content CMS Tables
// Add this to the restore transaction in restoreFromBackup()

// After restoring all existing tables, add these restore blocks:

console.log('📝 Restoring Web Content CMS tables...');

// Restore Hero Sections
console.log('   Restoring hero sections...');
if (backupData.data.heroSections?.length > 0) {
  try {
    for (const heroSection of backupData.data.heroSections) {
      await tx.heroSection.create({
        data: {
          ...heroSection,
          createdAt: heroSection.createdAt ? new Date(heroSection.createdAt) : new Date(),
          updatedAt: heroSection.updatedAt ? new Date(heroSection.updatedAt) : new Date()
        }
      });
    }
    console.log(`   ✅ ${backupData.data.heroSections.length} hero sections restored`);
  } catch (error) {
    console.error('   ❌ Error restoring hero sections:', error);
    throw error;
  }
}

// Restore Facilities
console.log('   Restoring facilities...');
if (backupData.data.facilities?.length > 0) {
  try {
    for (const facility of backupData.data.facilities) {
      await tx.facility.create({
        data: {
          ...facility,
          createdAt: facility.createdAt ? new Date(facility.createdAt) : new Date(),
          updatedAt: facility.updatedAt ? new Date(facility.updatedAt) : new Date()
        }
      });
    }
    console.log(`   ✅ ${backupData.data.facilities.length} facilities restored`);
  } catch (error) {
    console.error('   ❌ Error restoring facilities:', error);
    throw error;
  }
}

// Restore Testimonials
console.log('   Restoring testimonials...');
if (backupData.data.testimonials?.length > 0) {
  try {
    for (const testimonial of backupData.data.testimonials) {
      await tx.testimonial.create({
        data: {
          ...testimonial,
          createdAt: testimonial.createdAt ? new Date(testimonial.createdAt) : new Date(),
          updatedAt: testimonial.updatedAt ? new Date(testimonial.updatedAt) : new Date()
        }
      });
    }
    console.log(`   ✅ ${backupData.data.testimonials.length} testimonials restored`);
  } catch (error) {
    console.error('   ❌ Error restoring testimonials:', error);
    throw error;
  }
}

// Restore Gallery Images
console.log('   Restoring gallery images...');
if (backupData.data.galleryImages?.length > 0) {
  try {
    for (const galleryImage of backupData.data.galleryImages) {
      await tx.galleryImage.create({
        data: {
          ...galleryImage,
          createdAt: galleryImage.createdAt ? new Date(galleryImage.createdAt) : new Date(),
          updatedAt: galleryImage.updatedAt ? new Date(galleryImage.updatedAt) : new Date()
        }
      });
    }
    console.log(`   ✅ ${backupData.data.galleryImages.length} gallery images restored`);
  } catch (error) {
    console.error('   ❌ Error restoring gallery images:', error);
    throw error;
  }
}

// Restore Location Info
console.log('   Restoring location info...');
if (backupData.data.locationInfo?.length > 0) {
  try {
    for (const locationInfo of backupData.data.locationInfo) {
      await tx.locationInfo.create({
        data: {
          ...locationInfo,
          createdAt: locationInfo.createdAt ? new Date(locationInfo.createdAt) : new Date(),
          updatedAt: locationInfo.updatedAt ? new Date(locationInfo.updatedAt) : new Date()
        }
      });
    }
    console.log(`   ✅ ${backupData.data.locationInfo.length} location info restored`);
  } catch (error) {
    console.error('   ❌ Error restoring location info:', error);
    throw error;
  }
}

// Restore Landing Courses
console.log('   Restoring landing courses...');
if (backupData.data.landingCourses?.length > 0) {
  try {
    for (const landingCourse of backupData.data.landingCourses) {
      await tx.landingCourse.create({
        data: {
          ...landingCourse,
          createdAt: landingCourse.createdAt ? new Date(landingCourse.createdAt) : new Date(),
          updatedAt: landingCourse.updatedAt ? new Date(landingCourse.updatedAt) : new Date()
        }
      });
    }
    console.log(`   ✅ ${backupData.data.landingCourses.length} landing courses restored`);
  } catch (error) {
    console.error('   ❌ Error restoring landing courses:', error);
    throw error;
  }
}

// Restore Blog Posts
console.log('   Restoring blog posts...');
if (backupData.data.blogPosts?.length > 0) {
  try {
    for (const blogPost of backupData.data.blogPosts) {
      await tx.blogPost.create({
        data: {
          ...blogPost,
          createdAt: blogPost.createdAt ? new Date(blogPost.createdAt) : new Date(),
          updatedAt: blogPost.updatedAt ? new Date(blogPost.updatedAt) : new Date(),
          publishedAt: blogPost.publishedAt ? new Date(blogPost.publishedAt) : null,
          scheduledAt: blogPost.scheduledAt ? new Date(blogPost.scheduledAt) : null
        }
      });
    }
    console.log(`   ✅ ${backupData.data.blogPosts.length} blog posts restored`);
  } catch (error) {
    console.error('   ❌ Error restoring blog posts:', error);
    throw error;
  }
}

console.log('✅ Web Content CMS tables restored successfully');
