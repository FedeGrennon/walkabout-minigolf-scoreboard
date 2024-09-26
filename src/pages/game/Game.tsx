import React, { useState, useRef, useEffect } from 'react';
import './Game.css';
import { useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux';
import { useDispatch } from 'react-redux';
import {
    clearGame,
    setGame,
    IPlayer,
    OrderMode,
    IGame,
} from '../../redux/game-reducer';
import { toast } from 'react-toastify';

export const Game = () => {
    const dispatch: AppDispatch = useDispatch();
    const containerScoreTableRef = useRef<HTMLDivElement>(null);
    const scoreTableRef = useRef<HTMLTableElement>(null);

    const game = useSelector((state: RootState) => state.game);
    const [toastOpen, setToastOpen] = useState(false);
    const [scoreText, setScoreText] = useState('');
    const [scoreEditText, setScoreEditText] = useState('');

    useEffect(() => {
        cleanEdit();
    }, []);

    useEffect(() => {
        scrollToHole();
    }, [game.currentHoleIndex]);

    const currentHoleInfo = () => {
        const hole = game.holes[game.currentHoleIndex];
        return `Hole ${hole.number} - Par ${hole.par}`;
    };

    const getParsTotal = () => {
        return game.holes.reduce((prev, curr) => prev + curr.par, 0);
    };

    const getPlayerScoreText = (s: number | null) => {
        const number = s === null ? '-' : s === 0 ? 'E' : s;

        return `${(s ?? 0) > 0 ? '+' : ''}${number}`;
    };

    const getTotalPlayerScoreText = (player: IPlayer) => {
        const calculated = player.score
            .filter((value) => value !== null)
            .reduce((prev, curr) => prev + (curr.value ?? 0), 0);

        return `${calculated > 0 ? '+' : ''}${calculated === 0 ? 'E' : calculated} (${player.total})`;
    };

    const getCurrentPlayer = () => {
        const id = game.orderInCurrentHole[game.playersPlayedCount];
        return (
            game.players.find((player) => player.id === id) ?? game.players[0]
        );
    };

    const isPlayerSelected = (player: IPlayer) =>
        player.id === game.orderInCurrentHole[game.playersPlayedCount];

    const isHoleSelected = (number: number) =>
        number === game.holes[game.currentHoleIndex].number;

    const addScore = () => {
        if (game.ended) return;

        const amount = parseInt(scoreText);
        if (isNaN(amount)) return showError('Indicate the number of shots');
        if (amount <= 0) return showError('The number must be greater than 0');
        if (amount > 99) return showError('The number must be less than 99');
        const par = game.holes[game.currentHoleIndex].par;
        const currentPlayerId =
            game.orderInCurrentHole[game.playersPlayedCount];

        const updatedPlayers = game.players.map((player) => {
            if (currentPlayerId !== player.id) return player;

            return {
                ...player,
                total: player.total + amount,
                score: player.score.map((score, i) => {
                    if (i !== game.currentHoleIndex) return score;

                    return {
                        ...score,
                        value: amount - par,
                    };
                }),
            };
        });

        const gameMapped = nextTurn({ ...game, players: updatedPlayers });

        dispatch(setGame(gameMapped));
    };

    const sortOrderByScore = (
        aPlayer: IPlayer,
        bPlayer: IPlayer,
        holeIndex: number
    ): number => {
        if (holeIndex < 0) {
            if (aPlayer.total === bPlayer.total) return Math.random();
            return aPlayer.total - bPlayer.total;
        }

        const aValue = aPlayer.score[holeIndex].value ?? 0;
        const bValue = bPlayer.score[holeIndex].value ?? 0;

        if (aValue !== bValue) return aValue - bValue;

        return sortOrderByScore(aPlayer, bPlayer, holeIndex - 1);
    };

    const calculateOrder = (currentGame: IGame) => {
        if (currentGame.orderMode === OrderMode.BEST_SCORE) {
            const holeIndex = currentGame.currentHoleIndex;
            return [...currentGame.players]
                .sort((a, b) => sortOrderByScore(a, b, holeIndex))
                .map((player) => player.id);
        }

        if (currentGame.orderMode === OrderMode.LAST_FIRST) {
            const currentOrder = [...currentGame.orderInCurrentHole];
            const lastElement = currentOrder.pop();
            if (lastElement !== undefined) currentOrder.unshift(lastElement);
            return currentOrder;
        }

        return currentGame.orderInCurrentHole;
    };

    const nextTurn = (currentGame: IGame, passTurn = true) => {
        let ended = false;
        let playersPlayedCount =
            currentGame.playersPlayedCount + (passTurn ? 1 : 0);
        let currentHoleIndex = currentGame.currentHoleIndex;
        let orderInCurrentHole = currentGame.orderInCurrentHole;

        if (currentGame.players.length === playersPlayedCount) {
            if (currentGame.currentHoleIndex === currentGame.holes.length - 1)
                ended = true;

            if (!ended) {
                currentHoleIndex = currentHoleIndex + 1;
                orderInCurrentHole = calculateOrder(currentGame);
                playersPlayedCount = 0;
            }
        }

        setScoreText('');

        currentGame.playersPlayedCount = playersPlayedCount;
        currentGame.ended = ended;
        currentGame.currentHoleIndex = currentHoleIndex;
        currentGame.orderInCurrentHole = orderInCurrentHole;
        return currentGame;
    };

    const changeToEditScore = (
        playerIndex: number,
        scoreIndex: number,
        buttonId: string
    ) => {
        const hasOneEditing = game.players.some((player) =>
            player.score.some((score) => score.isEditing)
        );
        if (hasOneEditing) return;

        const updatedPlayers = game.players.map((player, index) => {
            if (playerIndex !== index) return player;

            return {
                ...player,
                score: player.score.map((score, i) => {
                    if (i !== scoreIndex) return score;

                    return {
                        ...score,
                        isEditing: true,
                    };
                }),
            };
        });

        const par = game.holes[scoreIndex].par;
        const prevScore =
            game.players[playerIndex].score[scoreIndex].value ?? 0;

        const shots = prevScore + par;

        setScoreEditText(shots.toString());

        dispatch(
            setGame({
                players: updatedPlayers,
            })
        );

        document.getElementById(buttonId)?.focus();
    };

    const editScore = (playerIndex: number, scoreIndex: number) => {
        const amount = parseInt(scoreEditText);

        if (isNaN(amount)) return showError('Indicate the number of shots');
        if (amount <= 0) return showError('The number must be greater than 0');
        if (amount > 99) return showError('The number must be less than 99');

        const par = game.holes[scoreIndex].par;
        const prevScore =
            game.players[playerIndex].score[scoreIndex].value ?? 0;

        const shots = prevScore + par;

        const updatedPlayers = game.players.map((player, index) => {
            if (playerIndex !== index) return player;

            return {
                ...player,
                total: amount - shots + player.total,
                score: player.score.map((score, i) => {
                    if (i !== scoreIndex) return score;

                    return {
                        ...score,
                        value: amount - par,
                        isEditing: false,
                    };
                }),
            };
        });

        dispatch(
            setGame({
                players: updatedPlayers,
            })
        );

        setScoreEditText('');
    };

    const cleanEdit = () => {
        const updatedPlayers = game.players.map((player) => {
            return {
                ...player,
                score: player.score.map((score) => ({
                    ...score,
                    isEditing: false,
                })),
            };
        });

        dispatch(
            setGame({
                players: updatedPlayers,
            })
        );
    };

    const showError = (message: string) => {
        toast(message, {
            type: 'error',
            theme: 'colored',
            autoClose: 3000,
            position: 'bottom-right',
        });
    };

    const scrollToHole = () => {
        const container = containerScoreTableRef.current;
        const scoreTable = scoreTableRef.current;

        if (!container || !scoreTable) return;

        const body = scoreTable.querySelector('thead');
        if (!body) return;

        const holes = body.children[0] as HTMLTableRowElement;
        const targetCell = holes.children[game.currentHoleIndex] as HTMLElement;

        if (!targetCell) return;

        const containerRect = container.getBoundingClientRect();

        const scrollLeft =
            targetCell.offsetLeft -
            containerRect.width / 2 +
            targetCell.offsetWidth / 2;
        container.scrollLeft = scrollLeft;
    };

    const finishGame = () => {
        if (toastOpen) return;

        const id = toast(
            <div className="close-container">
                <p>Are you sure you want to end the game?</p>

                <div className="close-buttons-container">
                    <button onClick={() => toast.dismiss(id)}>NO</button>
                    <button
                        onClick={() => {
                            setToastOpen(false);
                            toast.dismiss(id);
                            dispatch(clearGame());
                        }}
                    >
                        YES
                    </button>
                </div>
            </div>,
            {
                type: 'warning',
                theme: 'light',
                autoClose: false,
                position: 'top-center',
                hideProgressBar: true,
                closeOnClick: false,
                onClose: () => setToastOpen(false),
                onOpen: () => setToastOpen(true),
            }
        );
    };

    const deleteUser = (player: IPlayer) => {
        if (toastOpen) return;

        const id = toast(
            <div className="close-container">
                <p>Are you sure you want to delete the user {player.name}</p>

                <div className="close-buttons-container">
                    <button onClick={() => toast.dismiss(id)}>NO</button>
                    <button
                        onClick={() => {
                            setToastOpen(false);
                            toast.dismiss(id);
                            const players = game.players.filter(
                                (p) => p.id !== player.id
                            );
                            const orders = game.orderInCurrentHole.filter(
                                (id) => player.id !== id
                            );
                            const playersPlayedCount = game.players.reduce(
                                (acc, curr) =>
                                    acc +
                                    (curr.score[game.currentHoleIndex].value !==
                                    null
                                        ? 1
                                        : 0),
                                0
                            );

                            const gameMapped = {
                                ...game,
                                players,
                                orderInCurrentHole: orders,
                                playersPlayedCount,
                            };

                            if (players.length === 0) dispatch(clearGame());

                            const g = nextTurn(gameMapped, false);

                            dispatch(setGame(g));
                        }}
                    >
                        YES
                    </button>
                </div>
            </div>,
            {
                type: 'warning',
                theme: 'light',
                autoClose: false,
                position: 'top-center',
                hideProgressBar: true,
                closeOnClick: false,
                onClose: () => setToastOpen(false),
                onOpen: () => setToastOpen(true),
            }
        );
    };

    return (
        <div className="container hidden">
            <div className="row margin-none">
                <div className="column title-container">
                    <h1>{getCurrentPlayer().name}'s Turn</h1>
                    <button
                        className="u-pull-right finish-game-button"
                        onClick={finishGame}
                    >
                        END GAME
                    </button>
                </div>
            </div>
            <div className="row margin-none">
                <div className="column">
                    <h5>{currentHoleInfo()}</h5>
                </div>
            </div>
            <div className="row margin-none">
                <div className="column">
                    <input
                        type="number"
                        min={1}
                        step={1}
                        max={99}
                        maxLength={2}
                        placeholder="Number of shots"
                        className="u-full-width"
                        value={scoreText}
                        onChange={(e) => setScoreText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') addScore();
                        }}
                    />
                </div>
            </div>
            <div className="row">
                <div className="column tables-container">
                    <table className="titles-table margin-none">
                        <thead>
                            <tr>
                                <th>Hole</th>
                            </tr>
                            <tr>
                                <th>Par</th>
                            </tr>
                        </thead>
                        <tbody>
                            {game.players.map((player) => (
                                <tr
                                    title="Delete user"
                                    className="delete"
                                    key={player.name}
                                    aria-selected={isPlayerSelected(player)}
                                    onClick={() => deleteUser(player)}
                                >
                                    <td>{player.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div
                        ref={containerScoreTableRef}
                        className="u-full-width score-table-container"
                    >
                        <table
                            ref={scoreTableRef}
                            className="score-table u-full-width margin-none"
                        >
                            <thead>
                                <tr>
                                    {game.holes.map((hole) => (
                                        <th
                                            key={hole.number}
                                            aria-selected={isHoleSelected(
                                                hole.number
                                            )}
                                        >
                                            #{hole.number}
                                        </th>
                                    ))}
                                </tr>
                                <tr>
                                    {game.holes.map((hole) => (
                                        <th
                                            key={hole.number}
                                            aria-selected={isHoleSelected(
                                                hole.number
                                            )}
                                        >
                                            {hole.par}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {game.players.map((player, index) => (
                                    <tr
                                        key={player.name}
                                        aria-selected={isPlayerSelected(player)}
                                    >
                                        {player.score.map((s, i) => (
                                            <td
                                                key={i}
                                                aria-selected={isHoleSelected(
                                                    i + 1
                                                )}
                                                className={
                                                    s.value !== null
                                                        ? 'editable'
                                                        : ''
                                                }
                                                onClick={() => {
                                                    if (s.value !== null)
                                                        changeToEditScore(
                                                            index,
                                                            i,
                                                            `editInput${index}-${i}`
                                                        );
                                                }}
                                            >
                                                {s.isEditing ? (
                                                    <input
                                                        id={`editInput${index}-${i}`}
                                                        type="number"
                                                        min={1}
                                                        step={1}
                                                        max={99}
                                                        maxLength={2}
                                                        className="u-full-width score-edit-input"
                                                        value={scoreEditText}
                                                        onChange={(e) =>
                                                            setScoreEditText(
                                                                e.target.value
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                'Enter'
                                                            )
                                                                editScore(
                                                                    index,
                                                                    i
                                                                );
                                                            else if (
                                                                e.key ===
                                                                'Escape'
                                                            )
                                                                cleanEdit();
                                                        }}
                                                    />
                                                ) : (
                                                    getPlayerScoreText(s.value)
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <table className="totals-table margin-none">
                        <thead>
                            <tr>
                                <th>Total</th>
                            </tr>
                            <tr>
                                <th>{getParsTotal()}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {game.players.map((player) => (
                                <tr
                                    key={player.name}
                                    aria-selected={isPlayerSelected(player)}
                                >
                                    <td>{getTotalPlayerScoreText(player)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
