const db = require('../../db-connection/db-connection');
const ls = require('../../services/localStorage');
const nav = require('../../services/navigator');

const queryDepartments = () => `select name from upm.departments`;
const queryDoctors = () => `select first_name || ' ' || last_name as name from upm.doctors`;
const queryAddCourse = (course) => `
    insert into upm.courses values(${course.COURSE_ID}, '${course.TITLE}', ${course.CREDITS}, ${course.DEPARTMENT_ID}, ${course.DOCTOR_ID})
`;

function insertNewCourse(course) {
    return db.query(queryAddCourse(course))
}

function getDepartments() {
    db.query(queryDepartments()).then(departments => departments.map(addDepartmentToTemplate));
}

function getDoctors() {
    db.query(queryDoctors()).then(doctors => doctors.map(addDoctorsToTemplate));
}

function addDepartmentToTemplate(departmentName) {
    document.getElementById("departments").innerHTML += `
        <option value="${departmentName.NAME}">
    `;
}

function addDoctorsToTemplate(doctorName) {
    document.getElementById("doctors").innerHTML += `
        <option value="${doctorName.NAME}">
    `;
}

async function onSave() {
    department = {
        NAME: document.getElementById("course_department").value
    }
    let department_id;
    await insertDepartmentIfNotExist(department).then(department_ids => department_id = department_ids[0].DEPARTMENT_ID);

    doctorName = document.getElementById("doctor").value.split(" ");
    doctor = {
        FIRST_NAME: doctorName[0],
        LAST_NAME: doctorName[1]
    }
    let doctor_id;
    await insertDoctorIfNotExist(doctor).then(doctor_ids => doctor_id = doctor_ids[0].DOCTOR_ID);

    course = {
        COURSE_ID: document.getElementById("course_id").value,
        TITLE: document.getElementById("course_title").value,
        CREDITS: document.getElementById("course_credits").value,
        DEPARTMENT_ID: department_id,
        DOCTOR_ID: doctor_id
    }
    await insertNewCourse(course);

    nav.navigateToCoursesList();
}

async function insertDepartmentIfNotExist(department) {
    query = `
    insert into upm.departments (department_id, name) 
    select (select max(department_id) from upm.departments)+1, '${department.NAME}'
    from dual
    where not exists (select * 
        from upm.departments 
        where (upper(name) like upper('${department.NAME}')))
    `;
    await db.query(query)
    const id = await db.query(`select department_id from upm.departments where upper(name) like upper('${department.NAME}')`);
    return id;
}

async function insertDoctorIfNotExist(doctor) {
    query = `
    insert into upm.doctors (doctor_id, first_name, last_name) 
    select (select max(doctor_id) from upm.doctors)+1, '${doctor.FIRST_NAME}', '${doctor.LAST_NAME}'
    from dual
    where not exists (select * 
        from upm.doctors 
        where (upper(first_name) like upper('${doctor.FIRST_NAME}') and upper(last_name) like upper('${doctor.LAST_NAME}')))
    `;
    await db.query(query)
    const id = await db.query(`select doctor_id from upm.doctors where (upper(first_name) like upper('${doctor.FIRST_NAME}') and upper(last_name) like upper('${doctor.LAST_NAME}'))`);
    return id;
}

ls.setDoctor(1);
document.body.onload = () => {
    getDoctors();
    getDepartments();
}
