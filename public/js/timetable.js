const button = document.getElementById("loadTimetable");
const output = document.getElementById("output");

button.addEventListener("click", async () => {
    await loadTimetable();
});

async function loadTimetable(){
    const teacherId = teacherSelect.value;
    const subjectId = subjectSelect.value;
    const roomId = roomSelect.value;
    const groupId = groupSelect.value;
    console.log("Teacher ID =", teacherId);
    const response = await fetch(`/schedules?teacher_id=${teacherId}&subject_id=${subjectId}&room_id=${roomId}&group_id=${groupId}`);
    const data = await response.json();
    const timeSlot = new Set();
    const daySlot = new Set();
    for(const schedule of data){
        const Tslot = `${schedule.start_time} - ${schedule.end_time}`;
        timeSlot.add(Tslot);
        daySlot.add(schedule.day_of_week);
    }
    const timeSlots = [...timeSlot];
    const daySlots = [...daySlot];
    const dayOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];
    daySlots.sort((a, b) => {
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
    });
    timeSlots.sort((a,b) => {
        const startA = a.split(" - ")[0];
        const startB = b.split(" - ")[0];

        return startA.localeCompare(startB);
    });

    console.log(timeSlots);
    console.log(daySlots);

    let tableHtml = `
        <div class="table-responsive">
            <table class="table table-bordered table-hover align-middle text-center mb-0">
                <thead>
                    <tr>
                        <th class="table-light">Time</th>
    `;

    for(const day of daySlots){
        tableHtml += `
            <th class="table-light">${day}</th>
        `;
    }

    tableHtml += `
                </tr>
            </thead>
        <tbody>
    `;

    for(const time of timeSlots){
        tableHtml += `
            <tr>
                <td>${time}</td>
        `;

        for(const day of daySlots){
            const currentSchedule = data.find(schedule => {
                const slot = `${schedule.start_time} - ${schedule.end_time}`;
                return (
                    schedule.day_of_week === day && slot === time  
                );
            });

            tableHtml += `
                <td>
                    ${currentSchedule ? `
                        ${currentSchedule.subject_name}<br>
                        ${currentSchedule.first_name} ${currentSchedule.last_name}<br>
                        ${currentSchedule.room_name}
                        `
                        : "-"
                    }
                </td>
            `;
        }
        tableHtml += `
            </tr>
        `;
    }
    tableHtml += `
                </tbody>
            </table>
        </div>
    `;

    output.innerHTML = tableHtml;
}

const teacherSelect = document.getElementById("teacherSelect");
const subjectSelect = document.getElementById("subjectSelect");
const roomSelect = document.getElementById("roomSelect");
const groupSelect = document.getElementById("groupSelect");

async function loadSubjectSelect(){
    const response = await fetch("/subjects");
    const data = await response.json();
    subjectSelect.innerHTML = `<option value="">Select Subject</option>`;

    for(const subject of data){
        subjectSelect.innerHTML += `
            <option value="${subject.subject_id}">
                ${subject.subject_code} ${subject.subject_name}
            </option>
        `;
    }
}

async function loadTeacherSelect(){
    const response = await fetch("/teachers");
    const data = await response.json();
    teacherSelect.innerHTML = `<option value="">Select Teacher</option>`;

    for(const teacher of data){
        teacherSelect.innerHTML += `
            <option value="${teacher.teacher_id}">
                ${teacher.teacher_code} ${teacher.first_name} ${teacher.last_name}
            </option>
        `;
    }
}

async function loadRoomSelect(){
    const response = await fetch("/rooms");
    const data = await response.json();
    roomSelect.innerHTML = `<option value="">Select Room</option>`;

    for(const room of data){
        roomSelect.innerHTML += `
            <option value="${room.room_id}">
                ${room.room_name}
            </option>
        `;
    }
}

async function loadGroupSelect(){
    const response = await fetch("/student-groups");
    const data = await response.json();
    groupSelect.innerHTML = `<option value="">Select Group</option>`;

    for(const group of data){
        groupSelect.innerHTML += `
            <option value="${group.group_id}">
                ${group.group_name}
            </option>
        `;
    }
}

loadTeacherSelect();
loadSubjectSelect();
loadRoomSelect();
loadGroupSelect();