window.onload = function() {
  requiereCohorts();
};
// llamamos los cohorts
async function requiereCohorts() {
  let cohorts = '';
  try {
    const jsonCohorts = await fetch('https://laboratoria-la-staging.firebaseapp.com/cohorts/');
    cohorts = await jsonCohorts.json();
  } catch (err) {
    alert('no se pudierón cargar los datos' + err);
  }
  inputChange(cohorts);
}
inputChange = (cohorts) => {
  // mostrar la lista de cohorts
  const cohortsId = cohorts.map(cohort => cohort.id);
  const cohortList = document.getElementById('cohortsInput');
  cohortsId.forEach(function(item) {
    const option = document.createElement('option');
    option.innerText = item;
    cohortList.appendChild(option);
  });

  let searchString = '', findCohort = '', filter = '', direcction = '', users = '', progress = '';
  
  // Escuchar eventos del dom y llamar la funcion cada vez que se cambie el filtro
  document.getElementById('cohortsInput').addEventListener('change', async function() {
    // mostrar los elementos de la pagina cuando un cohort es seleccionado
    document.getElementById('filter-Students').classList.add('visibility');
    document.getElementById('stats').classList.add('visibility');

    // guardar el cohort seleccionado
    let cohortSelect = document.getElementById('cohortsInput').value;
    findCohort = cohorts.find(item => item.id === cohortSelect);
    let finCohortId = findCohort.id;

    // Buscar los usuarios del cohort seleccionado
    try {
      let jsonUsers = await fetch(`https://laboratoria-la-staging.firebaseapp.com/cohorts/${finCohortId}/users`);
      users = await jsonUsers.json();
      users = users.filter(element => element.role === 'student');
      // buscar el progreso de usuarios del cohort seleccionado
      let jsonProgress = await fetch(`https://laboratoria-la-staging.firebaseapp.com/cohorts/${finCohortId}/progress`);
      progress = await jsonProgress.json();
    } catch (err) {
      alert('no se pudierón cargar los datos' + err);
    }
    printData(processCohortData(createObjectOptions()));
  });
  document.getElementById('searchButtom').addEventListener('click', function() {
    searchString = document.getElementById('searchInput').value;
    document.getElementById('searchInput').value = '';
    printData(processCohortData(createObjectOptions()));
  });
  document.getElementById('filterButtom').addEventListener('click', function() {
    filter = document.getElementById('filterInput').value;
    direcction = document.filterForm.direction.value;
    printData(processCohortData(createObjectOptions()));
  });

  createObjectOptions = () => {
    const options = {
      cohort: findCohort,
      cohortData: {
        users: users,
        progress: progress,
      },
      orderBy: filter,
      orderDirection: direcction,
      search: searchString
    };
    return options;
  };
};

printData = (users) => {
  // cada vez que se llame a la función limpiar la pantalla
  document.getElementById('students').innerText = '';

  // Variables de estadisticas de cohort en general
  let completitudTotalSum = 0, percentLecturasSum = 0,
    percentQuizzSum = 0, percentExercisesSum = 0; completitudTotalUser = 0;
  
  for (let i = 0; i < users.length; i++) {
    const userList = document.getElementById('students');
    const newStudent = document.createElement('div');
    newStudent.classList.add('col-md-12');

    // para que sea una linea gris y una blanca
    if (i % 2 === 0) {
      newStudent.classList.add('studentOne');
    } else {
      newStudent.classList.add('studentTwo');
    }
    completitudTotalUser = Math.round((users[i].stats.exercises.percent + users[i].stats.reads.percent + users[i].stats.quizzes.percent) / 3);
    userList.appendChild(newStudent);
    createElement(newStudent, 'h4', users[i].name, 'col-md-2');
    createElement(newStudent, 'h4', completitudTotalUser + ' % ', 'col-md-2');
    createElement(newStudent, 'h4', users[i].stats.exercises.percent + ' % ', 'col-md-2');
    createElement(newStudent, 'h4', users[i].stats.quizzes.scoreAvg, 'col-md-2');
    createElement(newStudent, 'h4', users[i].stats.quizzes.percent + ' % ', 'col-md-2');
    createElement(newStudent, 'h4', users[i].stats.reads.percent + ' % ', 'col-md-2');

    function createElement(parent, element, text, clase) {
      const newElement = document.createElement(element);
      if (text === users[i].name) {
        newElement.classList.add('col-12');
      }
      newElement.innerText = text;
      newElement.classList.add(clase);
      newElement.classList.add('center');
      newElement.classList.add('col-2');
      parent.appendChild(newElement);
    }
    completitudTotalSum += completitudTotalUser ;
    percentLecturasSum += users[i].stats.reads.percent;
    percentQuizzSum += users[i].stats.quizzes.percent;
    percentExercisesSum += users[i].stats.exercises.percent;
  }

  // imprimir estadisticas de todo el cohort
  let completitudTotal = Math.round(completitudTotalSum / users.length),
    percentLecturas = Math.round(percentLecturasSum / users.length),
    percentQuizzes = Math.round(percentQuizzSum / users.length),
    percentExercises = Math.round(percentExercisesSum / users.length) ;
    
  document.getElementById('total').innerText = completitudTotal + ' % ';
  document.getElementById('lecturas').innerText = percentLecturas + ' % ';
  document.getElementById('quizzes').innerText = percentQuizzes + ' % ';
  document.getElementById('ejercicios').innerText = percentExercises + ' % ';
};
