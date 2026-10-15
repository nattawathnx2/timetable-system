const button = document.getElementById("loadTimetable");
const output = document.getElementById("output");

button.addEventListener("click", async () => {
    await loadTimetable();
});

function clearSelect(){
    teacherSelect.value = "";
    subjectSelect.value = "";
    roomSelect.value = "";
    groupSelect.value = "";
}

async function loadTimetable(){
    const user = JSON.parse(localStorage.getItem("user"));
    const teacherId = teacherSelect.value;
    const subjectId = subjectSelect.value;
    const roomId = roomSelect.value;
    const groupId = groupSelect.value;

    if(user?.role === "teacher" && !teacherId){
        output.innerHTML = `
            <div class="alert alert-info mb-0" role="alert">
                <strong>กรุณาเลือกเงื่อนไขก่อนโหลดตารางเรียน</strong>
                <p class="mb-0 mt-1">
                    โปรดเลือกรายชื่อของท่าน เพื่อแสดงข้อมูลตารางการสอนอย่างถูกต้อง
                </p>
            </div>
        `;
        return;
    }

    if(user?.role === "student" && !groupId){
        output.innerHTML = `
            <div class="alert alert-info mb-0" role="alert">
                <strong>กรุณาเลือกเงื่อนไขก่อนโหลดตารางเรียน</strong>
                <p class="mb-0 mt-1">
                    โปรดเลือกห้องเรียนของคุณ เพื่อแสดงข้อมูลตารางการเรียนอย่างถูกต้อง
                </p>
            </div>
        `;
        return;
    }

    const params = new URLSearchParams();

    if(user?.role === "admin"){
        if(!teacherId && !subjectId && !roomId && !groupId){
            output.innerHTML = `
                <div class="alert alert-info mb-0" role="alert">
                    <strong>กรุณาเลือกเงื่อนไขก่อนโหลดตารางเรียน</strong>
                    <p class="mb-0 mt-1">
                        โปรดเลือกห้องเรียน อาจารย์ ชื่อวิชาหรือกลุ่มเรียนอย่างน้อยหนึ่งรายการ
                        เพื่อป้องกันข้อมูลจากหลายตารางมาแสดงซ้ำในช่วงเวลาเดียวกัน
                    </p>
                </div>
            `;
            return;
        }

        if(teacherId) params.set("teacher_id", teacherId);
        if(subjectId) params.set("subject_id", subjectId);
        if(roomId) params.set("room_id", roomId);
        if(groupId) params.set("group_id", groupId);
    } else if(user?.role === "teacher"){
        params.set("teacher_id", teacherId);
    } else if(user?.role === "student"){
        params.set("group_id", groupId);
    } else {
        output.innerHTML = "";
        return;
    }

    console.log("Teacher ID =", teacherId);
    const response = await fetch(`/schedules?${params.toString()}`);
    if(!response.ok){
        output.innerHTML = "ไม่สามารถโหลดตารางเรียนได้";
        return;
    }
    const data = await response.json();
    
    const dayOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];

    const daySlots = dayOrder;

    const timeSlots = [];

    for(let hour = 8; hour < 21; hour++){
        const start = `${String(hour).padStart(2, "0")}:00:00`;
        const end = `${String(hour + 1).padStart(2, "0")}:00:00`;

        timeSlots.push({start, end});
    }

    const formatTime = (time) => {
        const [hour, minute] = time.split(":");
        return `${hour}:${minute}`;
    };

    let tableHtml = `
        <div class="table-responsive">
            <table class="table table-bordered table-hover align-middle text-center mb-0 timetable-table">
                <thead>
                    <tr>
                        <th class="table-light">Day</th>
    `;

    for(const time of timeSlots){
        tableHtml += `
                        <th class="table-light">
                            ${formatTime(time.start)}<br>
                            ${formatTime(time.end)}
                        </th>
        `;
    }

    tableHtml += `
                    </tr>
                </thead>
                <tbody>
    `;

    for(const day of daySlots){
        tableHtml += `
            <tr>
                <th class="table-light">${day}</th>
        `;

        let i = 0;

        while(i < timeSlots.length){
            const time = timeSlots[i];

            const currentSchedule = data.find(schedule => 
                schedule.day_of_week === day &&
                schedule.start_time < time.end &&
                schedule.end_time > time.start
            );

            if(!currentSchedule){
                tableHtml += `<td></td>`;
                i++;
                continue;
            }

            let span = 1;
            while(i + span < timeSlots.length){
                const nextTime = timeSlots[i + span];

                const nextSchedule = data.find(schedule => 
                    schedule.day_of_week === day &&
                    schedule.start_time < nextTime.end &&
                    schedule.end_time > nextTime.start
                );

                if(nextSchedule && nextSchedule.id === currentSchedule.id){
                    span++;
                } else {
                    break;
                }
            }

            tableHtml += `
                <td colspan="${span}">
                    <strong>${currentSchedule.subject_name}</strong><br>
                    ${currentSchedule.first_name} ${currentSchedule.last_name}<br>
                    <small>${currentSchedule.room_name}</small>
                </td>
            `;
            i += span;
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
    clearSelect();
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

const user = JSON.parse(localStorage.getItem("user"));

const filters = {
    teacher: document.getElementById("teacherFilter"),
    subject: document.getElementById("subjectFilter"),
    room: document.getElementById("roomFilter"),
    group: document.getElementById("groupFilter")
};

Object.values(filters).forEach(filter => {
    filter.hidden = true;
});

if(user?.role === "admin"){
    Object.values(filters).forEach(filter => {
        filter.hidden = false;
    });
}else if(user?.role === "teacher"){
    filters.teacher.hidden = false;
}else if(user?.role === "student"){
    filters.group.hidden = false;
}

loadTeacherSelect();
loadSubjectSelect();
loadRoomSelect();
loadGroupSelect();