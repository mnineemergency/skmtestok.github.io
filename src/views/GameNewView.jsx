import React, { useState, useContext } from 'react';
import HeaderFooter from '../components/HeaderFooter';
import useStyles from './GameNewViewStyles';
import { TextField, Paper, Button, Typography } from '@material-ui/core';
import { GameContext } from '../contexts/GameContext';
import { GameDispatchContext } from '../contexts/GameContext';
import { useHistory } from 'react-router-dom';
import GraphemeSplitter from 'grapheme-splitter';

export default function GameNewView() {
  const classes = useStyles();
  const game = useContext(GameContext);
  const dispatchGame = useContext(GameDispatchContext);
  let [cardsString, setCardsString] = useState(game.orderedCards.join(''));
  const history = useHistory();

  const [showError, setShowError] = useState(false);

  function handleCardsStringChange(e) {
    setCardsString(e.target.value.replace(/\s/g, ''));
  }

  function handleCreateClick() {
    if(cardsString !== ''){
      setShowError(false);

      const splitter = new GraphemeSplitter();
      const orderedCards = splitter.splitGraphemes(cardsString);

      dispatchGame({type: 'beginGame', payload: { orderedCards, player: 1 }});
      history.replace('/');
    } else {
      setShowError(true);
    }
  }

  return (
    <HeaderFooter className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="h4">Emoji list</Typography>
        <TextField
          id="outlined-multiline-static"
          multiline
          rows={3}
          autoFocus
          variant="outlined"
          className={classes.textArea}
          value={cardsString}
          onChange={handleCardsStringChange}
          InputProps={{
            classes: {
              input: classes.textAreaInput,
            },
          }}
          error={showError}
          helperText={showError && "Enter some emojis"}
        />
      </Paper>
      <Button variant="contained" color="primary" onClick={handleCreateClick}>Create</Button>
    </HeaderFooter>
  );
}
