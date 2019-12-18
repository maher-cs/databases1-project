const db = require('../../db-connection/db-connection');
const ls = require('../../services/localStorage');
const nav = require('../../services/navigator');

const doctorInfoQuery = (doctor_id) => `select * from upm.doctors where doctor_id = ${doctor_id}`;
const doctorCoursesQuery = (doctor_id) => `select course_id, title, credits, d.name as department_name from upm.courses natural join upm.departments d natural join upm.doctors where doctor_id = ${doctor_id}`

const doctorQuery = (doctor_id) => {
    db.query(doctorInfoQuery(doctor_id)).then(response => fillTemplate(response[0]));
    db.query(doctorCoursesQuery(doctor_id)).then(courses => courses.map(addCourse));
}

function fillTemplate(doctorInfo) {
    document.getElementById("doctor_name").innerHTML = "Doctor: " + doctorInfo.FIRST_NAME + " " + doctorInfo.LAST_NAME;
    document.getElementById("email").innerHTML = doctorInfo.EMAIL;
}

function addCourse(course) {
    const courseListElm = document.getElementById("courses-list");
    courseListElm.innerHTML += courseTemplate(course);
}

function courseTemplate(course) {
    return `
        <div class="col">
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${course.TITLE}</h5>
                    <div class="card-text">
                        <div>
                            <span class="text-muted">course id:</span>  ${course.COURSE_ID} <br>
                            <span class="text-muted">credits:</span> ${course.CREDITS} <br>
                            <span class="text-muted">department:</span> ${course.DEPARTMENT_NAME} <br>
                        </div>
                    </div>
                    <a href="#" onclick="nav.navigateToCourse(${course.COURSE_ID})" class="btn btn-primary mt-2 w-100">More Details</a>
                </div>
            </div>
        </div>
    `;
}


document.body.onload = () => {
    const doctor_id = ls.getDoctor();
    doctorQuery(doctor_id);
}
