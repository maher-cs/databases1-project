const ls = require('./localStorage');

const navigateToCourse = (course_id) => {
    ls.setCourse(course_id);
    window.location.href = "../course-info/course-info.html";
}

const navigateToCoursesList = () => {
    window.location.href = "../courses-list/courses-list.html";
}

const navigateToNewCourse = () => {
    window.location.href = "../course-new/course-new.html"
}

const navigateToDoctor = (doctor_id) => {
    ls.setDoctor(doctor_id);
    window.location.href = "../doctor-info/doctor-info.html";
}

const navigateToProject = (project_id) => {
    ls.setProject(project_id);
    window.location.href = "../project-info/project_info.html"
}

const navigateToProjectsList = () => {
    window.location.href = "../projects-list/projects-list.html"
}

const functions = {
    navigateToCourse,
    navigateToCoursesList,
    navigateToNewCourse,
    navigateToDoctor,
    navigateToProject,
    navigateToProjectsList
};

module.exports = functions;