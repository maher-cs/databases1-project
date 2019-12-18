const db = require('../../db-connection/db-connection');
const ls = require('../../services/localStorage');
const nav = require('../../services/navigator');

const queryCourse = (course_id) => `
        select c.course_id, c.title, c.credits, d.name as department_name, dr.first_name || ' ' || dr.last_name as doctor_name
        from upm.courses c
        left outer join upm.doctors dr
        on dr.doctor_id = c.doctor_id
        join upm.departments d
        on d.department_id = c.department_id
        where course_id = ${course_id}
    `;
const queryDepartments = () => `select name from upm.departments`;
const queryDoctors = () => `select first_name || ' ' || last_name as name from upm.doctors`;
const queryUpdateCourse = (course) => `
    update upm.courses
     set title = '${course.TITLE}', credits = ${course.CREDITS}, department_id = ${course.DEPARTMENT_ID}, doctor_id = ${course.DOCTOR_ID}
     where course_id = ${course.COURSE_ID}
    `;

function getCourse(course_id) {
    return db.query(queryCourse(course_id)).then(courses => fillTemplate(courses[0]))
}

function fillTemplate(course) {
    let elm = getElements();
    elm.ELM_COURSE_ID.value = course.COURSE_ID;
    elm.ELM_TITLE.value = course.TITLE;
    elm.ELM_CREDITS.value = course.CREDITS;
    elm.ELM_DEPARTMENT.value = course.DEPARTMENT_NAME;
    elm.ELM_DOCTOR.value = course.DOCTOR_NAME;
}

function getElements() {
    return {
        ELM_COURSE_ID: document.getElementById("course_id"),
        ELM_TITLE: document.getElementById("course_title"),
        ELM_CREDITS: document.getElementById("course_credits"),
        ELM_DEPARTMENT: document.getElementById("course_department"),
        ELM_DOCTOR: document.getElementById("doctor")
    }
}

function updateCourse(course) {
    return db.query(queryUpdateCourse(course))
}

function getDepartments() {
    db.query(queryDepartments()).then(departments => departments.map(addDepartmentToTemplate));
}

function getDoctors() {
    db.query(queryDoctors()).then(doctors => {
        doctors.map(addDoctorsToTemplate);
    });
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

async function onSaveEdit() {
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
    await updateCourse(course);

    nav.navigateToCourse(getCourseId());
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

function getCourseId() {
    return ls.getCourse();
}

function getInitValues() {
    const course_id = getCourseId();
    getCourse(course_id);
}

function onEdit() {
    let elements = [...document.getElementsByClassName("my-editable")];
    elements.forEach(element => {
        element.disabled = false;
    })
}

document.body.onload = () => {
    getInitValues();
    getDoctors();
    getDepartments();
}
