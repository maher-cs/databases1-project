const db = require('../../db-connection/db-connection');
const ls = require('../../services/localStorage');
const nav = require('../../services/navigator');

const projectInfoQuery = (project_id) => `
    select c.title, sts.status, p.description, grade, full_grade, to_char(start_date, 'MM/DD/YYYY') as start_date, to_char(delevary_date, 'MM/DD/YYYY') as delevary_date
        from upm.projects p
        join upm.courses c 
        on c.course_id = p.course_id
        join upm.status_table sts
        on sts.status_id = p.status_id
        where project_id = ${project_id}
`;
const projectStudentsQuery = (project_id) => `
    select s.student_id, s.first_name || ' ' || s.last_name as name, s.email, gs.role
        from upm.students s
        join upm.groups_students gs
        on gs.student_id = s.student_id
        join upm.groups g
        on gs.group_id = g.group_id
        where g.project_id = ${project_id} 
`;

const projectQuery = (project_id) => {
    db.query(projectInfoQuery(project_id)).then(response => fillTemplate(response[0]));
    db.query(projectStudentsQuery(project_id)).then(courses => courses.map(addStudent));
}

function fillTemplate(projectInfo) {
    let elements = getElements();
    elements.course_title.value = projectInfo.TITLE;
    elements.status.innerHTML = projectInfo.STATUS;
    elements.description.value = projectInfo.DESCRIPTION;
    elements.grade.value = projectInfo.GRADE === null ? 0 : projectInfo.GRADE;
    elements.full_grade.value = projectInfo.FULL_GRADE;
    elements.start_date.value = projectInfo.START_DATE;
    elements.delevary_date.value = projectInfo.DELEVARY_DATE === null ? '-' : projectInfo.DELEVARY_DATE;

    let statusColor;
    switch(projectInfo.STATUS) {
        case "in progress":
            statusColor = "warning";
            break;
        case "completed":
            statusColor = "success";
            break;
        case "deactivated":
            statusColor = "secondary";
            break;
    } 
    elements.status.className += ` badge-${statusColor}`;
    console.log(elements.status.className);
}

function getElements() {
    return {
        course_title: document.getElementById("course_title"),
        status: document.getElementById("status"),
        description: document.getElementById("description"),
        grade: document.getElementById("grade"),
        full_grade: document.getElementById("full_grade"),
        start_date: document.getElementById("start_date"),
        delevary_date: document.getElementById("delevary_date"),
    }
}

function addStudent(student) {
    document.getElementById("students-list").innerHTML += `
        <div class="col">
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${student.NAME}</h5>
                    <div class="card-text">
                        <div>
                            <span class="text-muted">email:</span>  ${student.EMAIL} <br>
                            <span class="text-muted">role:</span> ${student.ROLE} <br>
                        </div>
                    </div>
                    <a href="#" onclick="nav.navigateToCourse(${student.STUDENT_ID})" class="btn btn-primary mt-2 w-100">More Details</a>
                </div>
            </div>
        </div>
    `;
}

document.body.onload = () => {
    const project_id = ls.getProject();
    projectQuery(project_id);
}
