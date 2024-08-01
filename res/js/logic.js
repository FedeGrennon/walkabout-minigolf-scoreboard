const gameContainer = document.querySelector('#gameContainer');
const titleTable = document.querySelector('#titleTable');
const scoreTable = document.querySelector('#scoreTable');
const totalsTable = document.querySelector('#totalsTable');
const currentPlayerTitle = document.querySelector('#currentPlayerTitle');
const holeText = document.querySelector('#holeText');
const parText = document.querySelector('#parText');
const numberOfShotsInput = document.querySelector('#numberOfShotsInput');
const numberOfShotsButton = document.querySelector('#numberOfShotsButton');
const finalTable = document.querySelector('#finalTable');
const finishTitle = document.querySelector('#finishTitle');
const startButton = document.querySelector('#startButton');
const coursesList = document.querySelector('#coursesList');
const difficultiesList = document.querySelector('#difficultiesList');
const playerNameInput = document.querySelector('#playerNameInput');
const addPlayerButton = document.querySelector('#addPlayerButton');
const playersTable = document.querySelector('#playersTable');
const playAgainButton = document.querySelector('#playAgainButton');
const courseText = document.querySelector('#courseText');
const holeParsInput = document.querySelector('#holeParsInput');

const game = {
    currentHole: 0,
    currentPlayer: 0,
    playersPlayedCount: 0,
    players: [], // {name, score, total}
    course: {},
    holes: [], // {number, par}
    difficulty: '', // easy or hard
    ended: false
};

const showError = (message) => {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'center',
        stopOnFocus: true,
        style: {
          background: '#e25252',
        }
      }).showToast();
}

const addPlayer = (name) => {
    try {
        const players = game.players;
        if (!name)  throw new Error('The name can\'t be empty');
        if (players.some((player) => name.toLowerCase() === player.name.toLowerCase())) throw new Error('The name already exists');
    
        const titleTr = document.createElement('tr');
        const scoreTr = document.createElement('tr');
        const tdName = document.createElement('td');
    
        tdName.textContent = name;
        tdName.className = 'start';
    
        titleTr.appendChild(tdName);
    
        game.holes.forEach((_, i) => {
            const td = document.createElement('td');
            td.textContent = '-';
            td.setAttribute('aria-selected', i === game.currentHole);
            scoreTr.appendChild(td);
        })

        scoreTr.setAttribute('aria-selected', players.length === 0);
        titleTr.setAttribute('aria-selected', players.length === 0);

        if (players.length === 0)
            currentPlayerTitle.textContent = name;
    
        const titleBody = titleTable.querySelector('tbody');
        const scoreBody = scoreTable.querySelector('tbody');
        scoreBody.appendChild(scoreTr);
        titleBody.appendChild(titleTr);
    
        const totalTr = document.createElement('tr');
        const totalBody = totalsTable.querySelector('tbody');
    
        const tdTotal = document.createElement('td');
        tdTotal.textContent = '- (0)';

        totalTr.setAttribute('aria-selected', players.length === 0);
    
        totalTr.appendChild(tdTotal);
        totalBody.appendChild(totalTr);

        game.players.push({ name, score: [], total: 0 });
    } catch (e) {
        showError(e.message);
    }
};

const initTitles = () => {
    const head = titleTable.querySelector('thead');
    const holesTr = document.createElement('tr');
    const parTr = document.createElement('tr');

    const holeTh = document.createElement('th');
    holeTh.textContent = 'Hole';

    const parTh = document.createElement('th');
    parTh.textContent = 'Par';

    courseText.textContent = game.course.name;

    holesTr.appendChild(holeTh);
    parTr.appendChild(parTh);
    head.appendChild(holesTr);
    head.appendChild(parTr);
};

const initHoles = () => {
    holeText.textContent = game.currentHole + 1;

    const head = scoreTable.querySelector('thead');
    const tr = document.createElement('tr');

    game.holes.forEach((hole, i) => {
        const th = document.createElement('th');
        th.textContent = hole.number;
        th.setAttribute('aria-selected', i === game.currentHole);
        tr.appendChild(th);
    })

    head.appendChild(tr);

    const totalsHead = totalsTable.querySelector('thead');
    const totalsTr = document.createElement('tr');

    const totalTh = document.createElement('th');
    totalTh.textContent = 'Total';

    totalsTr.appendChild(totalTh);
    totalsHead.appendChild(totalsTr);
};

const initPar = () => {
    const head = scoreTable.querySelector('thead');
    const parTr = document.createElement('tr');

    game.holes.forEach((hole, i) => {
        const th = document.createElement('th');

        th.textContent = hole.par;
        th.setAttribute('aria-selected', i === game.currentHole);
        parTr.appendChild(th);
    })

    head.appendChild(parTr);

    const totalsHead = totalsTable.querySelector('thead');
    const totalsTr = document.createElement('tr');

    const totalTh = document.createElement('th');
    totalTh.textContent = game.holes.reduce((prev, curr) => prev + curr.par, 0);

    totalsTr.appendChild(totalTh);
    totalsHead.appendChild(totalsTr);

    parText.textContent = game.holes[game.currentHole].par;
};

const finishGame = () => {
    game.ended = true;

    const sortPlayers = [...game.players].sort((a, b) => a.total - b.total);

    const winners = game.players.reduce((prev, curr) => {
        if (prev.length === 0 || curr.total === prev[0].total) {
            prev.push(curr);
        } else if (curr.total < prev[0].total) {
            prev = [];
            prev.push(curr);
        }

        return prev;
    }, []);

    if (winners.length === 1)
        finishTitle.textContent = `Congratulations, ${winners[0].name}! 🏆`;
    else
        finishTitle.textContent = 'What a thrilling tie! 🤝';

    const body = finalTable.querySelector('tbody');
    const fragment = document.createDocumentFragment();

    sortPlayers.forEach(player => {
        const tr = document.createElement('tr');
        const nameTd = document.createElement('td');
        const totalTd = document.createElement('td');
        nameTd.textContent = player.name;

        const score = player.score.reduce((prev, curr) => prev + curr, 0);

        totalTd.textContent = `${score > 0 ? '+' : ''} ${score === 0 ? 'E' : score} (${player.total})`;

        tr.appendChild(nameTd);
        tr.appendChild(totalTd);
        fragment.appendChild(tr);
    });
    
    body.appendChild(fragment);

    MicroModal.show('game-over-modal');
    gameContainer.classList.add('hidden');
}

const scrollToHole = (holeIndex) => {
    const container = document.querySelector('#scrollTable');
    const body = scoreTable.querySelector('thead');
    const holes = body.children[0];
    const targetCell = holes.children[holeIndex];

    const containerRect = container.getBoundingClientRect();

    const scrollLeft = targetCell.offsetLeft - (containerRect.width / 2) + (targetCell.offsetWidth / 2);
    container.scrollLeft = scrollLeft;
};

const changeHole = () => {
    if (game.currentHole === game.holes.length - 1) return finishGame();

    game.currentHole++;
    const currentHole = game.currentHole;
    game.playersPlayedCount = 0;

    const head = scoreTable.querySelector('thead');
    const body = scoreTable.querySelector('tbody');

    for (const node of head.children) {
        node.children[currentHole - 1].setAttribute('aria-selected', 'false');
        node.children[currentHole].setAttribute('aria-selected', 'true');
    }

    for (const node of body.children) {
        node.children[currentHole - 1].setAttribute('aria-selected', 'false');
        node.children[currentHole].setAttribute('aria-selected', 'true');
    }

    const hole = game.holes[currentHole];
    holeText.textContent = hole.number;
    parText.textContent = hole.par;

    scrollToHole(currentHole);
}

const nextTurn = () => {
    if (game.players.length === game.playersPlayedCount) {
        changeHole();
        return;
    }
    
    const prevPlayer = game.currentPlayer;
    game.currentPlayer = game.currentPlayer === game.players.length - 1 ? 0 : game.currentPlayer + 1;

    const scoreBody = scoreTable.querySelector('tbody');
    const titleBody = titleTable.querySelector('tbody');
    const totalsBody = totalsTable.querySelector('tbody');

    scoreBody.children[prevPlayer].setAttribute('aria-selected', 'false');
    scoreBody.children[game.currentPlayer].setAttribute('aria-selected', 'true');
    titleBody.children[prevPlayer].setAttribute('aria-selected', 'false');
    titleBody.children[game.currentPlayer].setAttribute('aria-selected', 'true');
    totalsBody.children[prevPlayer].setAttribute('aria-selected', 'false');
    totalsBody.children[game.currentPlayer].setAttribute('aria-selected', 'true');

    currentPlayerTitle.textContent = game.players[game.currentPlayer].name;
}

const addShot = (number) => {
    try {
        if (game.ended) return;

        const amount = parseInt(number);
        if (isNaN(amount)) throw new Error('Indicate the number of shots');
        if (amount <= 0) throw new Error('The number must be greater than 0');

        const player = game.players[game.currentPlayer];
        const par = game.holes[game.currentHole].par;
        const score = amount - par;

        player.score.push(score);
        player.total += amount;
        game.playersPlayedCount++;
        
        const scoreBody = scoreTable.querySelector('tbody');
        const scoreTr = scoreBody.children[game.currentPlayer];
        const scoreTd = scoreTr.children[game.currentHole];
        scoreTd.textContent = `${score > 0 ? '+' : ''} ${score === 0 ? 'E' : score}`;

        const totalBody = totalsTable.querySelector('tbody');
        const totalTr = totalBody.children[game.currentPlayer];
        const totalTd = totalTr.children[0];

        const totalScore = player.score.reduce((prev, curr) => prev + curr, 0);

        totalTd.textContent = `${totalScore > 0 ? '+' : ''}  ${totalScore === 0 ? 'E' : totalScore} (${player.total})`;

        numberOfShotsInput.value = '';

        nextTurn();
    } catch (e) {
        showError(e.message);
    }
}

const getTemporalPlayers = () => {
    const body = playersTable.querySelector('tbody');
    const names = [];
    for (const element of body.children) {
        names.push(element.getAttribute('value'));
    }

    return names;
}

const startGame = () => {
    try {
        const temporalPlayers = getTemporalPlayers();
        if (temporalPlayers.length === 0)
            throw new Error('You need to add at least 1 player');

        const holePars = validateHolePars();

        game.ended = false;
        game.difficulty = difficultiesList.value;
        game.course = courses[parseInt(coursesList.value)];
        game.holes = holePars.map((par, i) => ({ number: i + 1, par }));

        initTitles();
        initHoles();
        initPar();

        temporalPlayers
            .sort(() => Math.random() - 0.5)
            .forEach((name) => addPlayer(name));

        gameContainer.classList.remove('hidden');
        MicroModal.close('init-game-modal');
    } catch (e) {
        showError(e.message);
    }
};

const addTemporalPlayer = () => {
    try {
        const temporalPlayers = getTemporalPlayers();
        const name = playerNameInput.value;
        if (!name)  throw new Error('The name can\'t be empty');
        if (temporalPlayers.some((tempName) => name.toLowerCase() === tempName.toLowerCase())) throw new Error('The name already exists');
    
        const body = playersTable.querySelector('tbody');
        const tr = document.createElement('tr');
        const td = document.createElement('td');
    
        tr.setAttribute('value', name);
        tr.addEventListener('click', () => {
            body.removeChild(tr);
        });

        td.textContent = name;
        td.classList.add('start');

        tr.appendChild(td);
        body.appendChild(tr);

        playerNameInput.value = '';
    } catch (e) {
        showError(e.message);
    }
}

const init = () => {
    courses
        .sort((a, b) => a.name - b.name)
        .forEach((course, i) => {
            coursesList.add(new Option(course.name, i))
        })

    changeHolePars();

    MicroModal.show('init-game-modal');
}

const playAgain = () => {
    game.currentHole = 0;
    game.currentPlayer = 0;
    game.playersPlayedCount = 0;
    game.players = [];
    game.course = {};
    game.holes = [];
    game.difficulty = '';
    game.ended = false;

    titleTable.querySelector('thead').innerHTML = '';
    titleTable.querySelector('tbody').innerHTML = '';

    scoreTable.querySelector('thead').innerHTML = '';
    scoreTable.querySelector('tbody').innerHTML = '';

    totalsTable.querySelector('thead').innerHTML = '';
    totalsTable.querySelector('tbody').innerHTML = '';

    finalTable.querySelector('tbody').innerHTML = '';

    MicroModal.close('game-over-modal');
    MicroModal.show('init-game-modal');
};

const changeHolePars = () => {
    holeParsInput.value = courses[parseInt(coursesList.value)][difficultiesList.value].join(',');
}

const validateHolePars = () => {
    const holePars = holeParsInput.value.split(',').map((par) => parseInt(par));

    if (holePars.length !== 18) throw new Error('There must be 18 exact pars');
    if (holePars.some((par) => isNaN(par))) throw new Error('Pars must be integers');
    if (holePars.some((par) => par <= 0)) throw new Error('Pars must be greater than 0');

    return holePars;
}

numberOfShotsButton.addEventListener('click', () => addShot(numberOfShotsInput.value));
numberOfShotsInput.addEventListener('keydown', (e) => { if (e.keyCode === 13) addShot(numberOfShotsInput.value); });

startButton.addEventListener('click', startGame);

addPlayerButton.addEventListener('click', addTemporalPlayer);
playerNameInput.addEventListener('keydown', (e) => { if (e.keyCode === 13) addTemporalPlayer(); });

playAgainButton.addEventListener('click', playAgain);
document.addEventListener('keydown', (e) =>  { if (e.keyCode === 13) e.preventDefault(); });

coursesList.addEventListener('change', changeHolePars);
difficultiesList.addEventListener('change', changeHolePars);
holeParsInput.addEventListener('change', () => {
    try { validateHolePars() }
    catch (e) { showError(e.message); }
});

init();
