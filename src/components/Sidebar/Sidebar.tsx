import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

import { useAppState } from '../../state';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    sidebar: {
      width: '200px',
      height: '100%',
      position: 'absolute',
      left: '0',
      top: '0',
      backgroundColor: '#999',
      textAlign: 'center',
      paddingTop: '70px',
    },
    form: {
      maxWidth: '80%',
      margin: '0 auto',
    },
    textField: {},
    displayName: {},
    joinButton: {
      display: 'block',
      width: '100%',
      marginTop: '10px',
    },
    loadingSpinner: {},
  })
);

export default function Sidebar() {
  const classes = useStyles();
  const roomState = useRoomState();
  const { isConnecting, connect } = useVideoContext();
  const { user, getToken, isFetching } = useAppState();
  const [name, setName] = useState<string>(user?.displayName || '');
  const [roomName, setRoomName] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // If this app is deployed as a twilio function, don't change the URL beacuse routing isn't supported.
    if (!window.location.origin.includes('twil.io')) {
      window.history.replaceState(null, '', window.encodeURI(`/room/${roomName}${window.location.search || ''}`));
    }
    getToken(name, roomName).then(token => connect(token));
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleRoomNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  return (
    <div className={clsx(classes.sidebar)}>
      {roomState === 'disconnected' ? (
        <form className={classes.form} onSubmit={handleSubmit}>
          {window.location.search.includes('customIdentity=true') || !user?.displayName ? (
            <TextField
              id="menu-name"
              label="Name"
              className={classes.textField}
              value={name}
              onChange={handleNameChange}
              margin="dense"
            />
          ) : (
            <Typography className={classes.displayName} variant="body1">
              {user.displayName}
            </Typography>
          )}
          <TextField
            id="menu-room"
            label="Room"
            className={classes.textField}
            value={roomName}
            onChange={handleRoomNameChange}
            margin="dense"
          />
          <Button
            className={classes.joinButton}
            type="submit"
            color="primary"
            variant="contained"
            disabled={isConnecting || !name || !roomName || isFetching}
          >
            Go
          </Button>
          {(isConnecting || isFetching) && <CircularProgress className={classes.loadingSpinner} />}
        </form>
      ) : (
        <h3>{roomName}</h3>
      )}
    </div>
  );
}
