import React, { useEffect } from 'react';
import useLocalStorageReducer from '../hooks/useLocalStorageReducer';
import seedrandom from 'seedrandom';

const GameContext = React.createContext();
const GameDispatchContext = React.createContext();

export const defaultSeed = 'SEED';

// Default game object
const defaultGame = {
  seed: defaultSeed,
  round: 1,
  orderedCards: [],

  player: null,
  shuffledCards: [],
  card: '',
}

// Fisher-Yates Algorithm
function shuffle(array, randomGenerator) {
  array = [...array];
  for(let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(randomGenerator() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const reducer = (state, {type, payload}) => {
  switch (type) {
    case "beginGame":
      const newGame = { ...defaultGame, seed: Math.random().toString(36).substring(2, 6), ...payload };
      if(navigator.share){
        navigator.share({text: getGameShareText(newGame)})
      }
      return newGame;
    case "shuffle":
      const randomGenerator = seedrandom(`${state.seed}-${state.round}`);
      return { ...state, shuffledCards: shuffle(state.orderedCards, randomGenerator) };
    case "updateCard":
      return { ...state, card: state.shuffledCards[state.player - 1] || '' };
    case "nextRound":
      return { ...state, round: state.round + 1 };
    case "prevRound":
      return { ...state, round: (state.round >= 2 ? state.round - 1 : 1)};
    case "setPlayer":
      return { ...state, player: payload.player };
    default:
      console.error(`Unknown action.type "${type}" for GameContext`);
      return { ...state };
  }
};

function GameContextProvider(props) {
  let [game, dispatchGame] = useLocalStorageReducer(reducer, defaultGame, 'game');

  useEffect(() => {
    dispatchGame({type: 'shuffle'})
  }, [game.orderedCards, game.seed, game.round, dispatchGame]);

  useEffect(() => {
    dispatchGame({type: 'updateCard'})
  }, [game.shuffledCards, game.player, dispatchGame]);

  return (
    <GameContext.Provider value={game}>
      <GameDispatchContext.Provider value={dispatchGame}>
        {props.children}
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  );
}

const GameContextConsumer = GameContext.Consumer;

export function getGameURL({seed, orderedCards, round}){
  return `${process.env.REACT_APP_DOMAIN}?s=${seed}&c=${orderedCards.join('')}${round !== 1 ? `&r=${round}` : ''}`;
}
export function getGameShareText({seed, orderedCards, round}){
  const invitationURL = getGameURL({seed, orderedCards, round});
  return `Room: ${seed}\nCards: ${orderedCards.join('')}\n${round > 1 ? `Round: ${round}\n` : ''}\n${invitationURL}`;
}

export { GameContext, GameDispatchContext, GameContextProvider, GameContextConsumer };
