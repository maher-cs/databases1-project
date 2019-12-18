const db = require('../../db-connection/db-connection');
const nav = require('../../services/navigator');

const coursesListQuery = () => 
    `select c.course_id, title, credits, d.name as department_name, dr.first_name || ' ' || dr.last_name as doctor_name, dr.doctor_id, number_of_projects
        from upm.courses c
        left outer join (select course_id, count(course_id) as number_of_projects from upm.projects group by course_id) p
        on c.course_id = p.course_id
        join upm.departments d
        on d.department_id = c.department_id
        join upm.doctors dr
        on dr.doctor_id = c.doctor_id
    `;

const coursesQuery = (query = coursesListQuery()) => {
    db.query(query).then(courses => courses.map(addCourse));
}

function addCourse(course, index) {
    const courseListElm = document.getElementById("courses-table-data");
    courseListElm.innerHTML += courseTemplate(course, index);
}

function courseTemplate(course, index) {
    return `
        <tr>
            <th scope="row">${index + 1}</th>
            <td onclick="nav.navigateToCourse(${course.COURSE_ID})" style="cursor: pointer">${course.COURSE_ID}</td>
            <td onclick="nav.navigateToCourse(${course.COURSE_ID})" style="cursor: pointer">${course.TITLE}</td>
            <td>${course.CREDITS}</td>
            <td>${course.DEPARTMENT_NAME}</td>
            <td onclick="nav.navigateToDoctor(${course.DOCTOR_ID})" style="cursor: pointer">${course.DOCTOR_NAME}</td>
            <td>${course.NUMBER_OF_PROJECTS === null ? 0 : course.NUMBER_OF_PROJECTS}</td>
        </tr>
    `;
}

function applayFilters() {
    let courseTitle = document.getElementById("filter-course-title").value;
    courseTitle = courseTitle === null ? "" : courseTitle;
    let departmentName = document.getElementById("filter-course-department").value;
    departmentName = departmentName === null ? "" : departmentName;
    let doctorName = document.getElementById("filter-course-doctor").value;
    doctorName = doctorName === null ? "" : doctorName;
    
    let query = `
        select c.course_id, title, credits, d.name as department_name, dr.first_name || ' ' || dr.last_name as doctor_name, dr.doctor_id, number_of_projects
            from upm.courses c
            left outer join (select course_id, count(course_id) as number_of_projects from upm.projects group by course_id) p
            on c.course_id = p.course_id
            join upm.departments d
            on d.department_id = c.department_id
            join upm.doctors dr
            on dr.doctor_id = c.doctor_id
            where upper(dr.first_name || ' ' || dr.last_name) like ('%' || upper('${doctorName}') || '%')
            and upper(d.name) like ('%' || upper('${departmentName}') || '%')
            and upper(title) like ('%' || upper('${courseTitle}') || '%')
        `;

    // clear current list
    const courseListElm = document.getElementById("courses-table-data");
    courseListElm.innerHTML = "";

    // query the new data
    coursesQuery(query);
}

document.body.onload = () => {
    coursesQuery();
}
