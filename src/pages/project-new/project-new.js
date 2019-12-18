const db = require('../../db-connection/db-connection');
const ls = require('../../services/localStorage');
const nav = require('../../services/navigator');

const studentsQuery = () => `select first_name || ' ' || last_name as name from upm.students`;
const coursesQuery = () => `select course_id, title from upm.courses`;

const queryStudents = () => db.query(studentsQuery()).then(students => students.map(addStudentTDataList));
const queryCourses = () => db.query(coursesQuery()).then(courses => courses.map(addCourseToDropDown))

function addStudentTDataList(student) {
    document.getElementById("students").innerHTML += `
        <option value="${student.NAME}">
    `;
}

function addCourseToDropDown(course) {
    document.getElementById("course").innerHTML += `
        <option value="${course.COURSE_ID}">${course.TITLE}</option>
    `;
}

let studentFieldsCounter = 0;
function addStudentField() {
    let c = ++studentFieldsCounter;
    const studentFieldContainer = document.getElementById("students-form");
    studentFieldContainer.innerHTML += `
        <div class="col-12 m-2">
            <input class="form-control student" type="text" name="student${c}" id="student${c}"
                placeholder="enter student name..." list="students">
        </div>
    `
}

async function onSave() {
    let project_id;
    await createNewProject().then(p_id => project_id = p_id);
    let group_id;
    await createNewGroup(project_id).then(groups => group_id = groups[0].GROUP_ID);
    let group = {
        PROJECT_ID: project_id,
        GROUP_ID: group_id
    };
    let students = [...document.getElementsByClassName("student")];

    students.map(async s => {
        await insertStudentIfNotExist(s.value)
        .then(student => {
            addStudentToGroup(student[0], group)
        })
    });

    nav.navigateToProjectsList();
}

async function insertStudentIfNotExist(student) {
    student = {
        FIRST_NAME: student.split(" ")[0],
        LAST_NAME: student.split(" ")[1],
        NAME: student
    }
    let query = `
    insert into upm.students (student_id, first_name, last_name) 
    select (select max(student_id) from upm.students)+1, '${student.FIRST_NAME}', '${student.LAST_NAME}'
    from dual
    where not exists (select first_name || ' ' || last_name
        from upm.students 
        where (upper(first_name || ' ' || last_name) like upper('${student.NAME}')))
    `;
    await db.query(query)
    const id = await db.query(`select student_id from upm.students where upper(first_name || ' ' || last_name) like upper('${student.NAME}')`);
    return id;
}

async function createNewGroup(project_id) {
    let project = {
        PROJECT_ID: project_id
    };
    let query = `
        insert into upm.groups values ( (select max(group_id) from upm.groups)+1 , ${project.PROJECT_ID})
    `;
    await db.query(query);
    const p = await db.query(`select group_id from upm.groups where project_id = ${project.PROJECT_ID}`);
    return p;
}

async function addStudentToGroup(student, group) {
    let query = `
        insert into upm.groups_students (student_id, group_id) values(${student.STUDENT_ID}, ${group.GROUP_ID})
    `
    const p = await db.query(query);
    return p;
}

async function createNewProject() {
    let project_id;
    await db.query(`select max(project_id) as last_id from upm.projects`).then(projects => project_id = projects[0].LAST_ID);
    let status_id;
    await db.query(`select status_id from upm.status_table where status like 'in progress'`).then(statuses => status_id = statuses[0].STATUS_ID);

    let project = {
        PROJECT_ID: project_id+1,
        STATUS: status_id,
        GRADE: document.getElementById("grade").value === "" ? "null" : document.getElementById("grade").value,
        FULL_GRADE: document.getElementById("full_grade").value,
        DESCRIPTION: document.getElementById("description").value,
        START_DATE: document.getElementById("start_date").value,
        DELEVARY_DATE: document.getElementById("delevary_date").value,
        COURSE_ID: document.getElementById("course").value
    }

    let query = `
        insert into upm.projects values (
            ${project.PROJECT_ID},
            ${project.STATUS},
            ${project.GRADE},
            ${project.FULL_GRADE},
            '${project.DESCRIPTION}',
            TO_DATE('${project.START_DATE}','YYYY-MM-DD'),
            TO_DATE('${project.DELEVARY_DATE}','YYYY-MM-DD'),
            ${project.COURSE_ID}
        )
    `;
    await db.query(query);
    return project.PROJECT_ID;
}

document.body.onload = () => {
    queryCourses();
    queryStudents();
}