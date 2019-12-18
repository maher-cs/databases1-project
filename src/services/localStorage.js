function setCourse(course_id) {
    window.localStorage.setItem("course", course_id);
}

function getCourse() {
    return window.localStorage.getItem("course");
}

function setDoctor(doctor_id) {
    window.localStorage.setItem("doctor", doctor_id);
}

function getDoctor() {
    return window.localStorage.getItem("doctor");
}

function setProject(project_id) {
    window.localStorage.setItem("project", project_id);
}

function getProject() {
    return window.localStorage.getItem("project");
}

const functions = {
    setCourse: setCourse,
    getCourse: getCourse,
    setDoctor: setDoctor,
    getDoctor: getDoctor,
    setProject: setProject,
    getProject: getProject
};

module.exports = functions;