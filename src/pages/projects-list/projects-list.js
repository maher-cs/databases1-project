const db = require('../../db-connection/db-connection');
const nav = require('../../services/navigator');

const projectsListQuery = () =>
    `select p.project_id, c.course_id, c.title, sts.status, description, to_char(start_date, 'MM/DD/YYYY') as start_date, to_char(delevary_date, 'MM/DD/YYYY') as delevary_date, grade, full_grade
        from upm.projects p
        join upm.courses c
        on c.course_id = p.course_id
        join upm.status_table sts
        on p.status_id = sts.status_id
    `;
const queryStatuses = () => `select status from upm.status_table`;


const statusesQuery = () => 
    db.query(queryStatuses()).then(statuses => statuses.map(addStatus));

const projectsQuery = (query = projectsListQuery()) => 
    db.query(query).then(projects => projects.map(addproject));

function addproject(project, index) {
    const projectListElm = document.getElementById("projects-table-data");
    projectListElm.innerHTML += projectTemplate(project, index);
}

function addStatus(status) {
    const statusFilterElm = document.getElementById("filter-status");
    statusFilterElm.innerHTML += `
        <option value=${status.STATUS}>${status.STATUS}</option>
    `;
}

function projectTemplate(project, index) {
    let statusColor;
    switch(project.STATUS) {
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
    return `
        <tr>
            <td>${index + 1}</td>
            <td><a href="../project-info/project-info.html" onclick="ls.setProject(${project.PROJECT_ID})">${project.PROJECT_ID}</a></td>
            <td onclick="nav.navigateToCourse(${project.COURSE_ID})" style="cursor: pointer">${project.TITLE}</td>
            <td><span class="badge badge-${statusColor}">${project.STATUS}</span></td>
            <td>${project.DESCRIPTION}</td>
            <td>${project.START_DATE}</td>
            <td>${project.DELEVARY_DATE === null ? "-": project.DELEVARY_DATE}</td>
            <td>${project.GRADE === null ? "-" : project.GRADE}</td>
            <td>${project.FULL_GRADE}</td>
        </tr>
    `;
}

function applayFilters() {
    let course = document.getElementById("filter-course").value;
    course = course === null ? "" : course;
    let status = document.getElementById("filter-status").value;
    status = status === null ? "" : status;

    let query = `
        select c.title, sts.status, description, to_char(start_date, 'MM/DD/YYYY') as start_date, to_char(delevary_date, 'MM/DD/YYYY') as delevary_date, grade, full_grade
            from upm.projects p
            join upm.courses c
            on c.course_id = p.course_id
            join upm.status_table sts
            on sts.status_id = sts.status_id
            where upper(status) like upper('%' || '${status}' || '%')
            and upper(title) like upper('%' || '${course}' || '%')
    `;

    // clear current list
    const projectListElm = document.getElementById("projects-table-data");
    projectListElm.innerHTML = "";

    // query the new data
    projectsQuery(query);
}

function getStatuses() {
    statusesQuery();
}

document.body.onload = () => {
    getStatuses();
    projectsQuery();
}
