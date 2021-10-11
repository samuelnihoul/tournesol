import React from 'react';
import clsx from 'clsx';
import { useLocation, useHistory } from 'react-router-dom';
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  List,
  Theme,
} from '@material-ui/core';
// import ListIcon from '@material-ui/icons/FormatListBulleted';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { useAppSelector } from '../../../../app/hooks';
import { selectFrame } from '../../drawerOpenSlice';
import { topBarHeight } from '../topbar/TopBar';
import {
  Home as HomeIcon,
  Compare as CompareIcon,
  WatchLater as WatchLaterIcon,
  VideoLibrary,
} from '@material-ui/icons';

import { useAppDispatch } from '../../../../app/hooks';
import { closeDrawer } from '../../drawerOpenSlice';

export const sideBarWidth = 240;

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    width: sideBarWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: sideBarWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
  },
  drawerPaper: {
    top: topBarHeight,
    [theme.breakpoints.down('sm')]: {
      top: 0,
    },
  },
}));

const SideBar = () => {
  const classes = useStyles();
  const drawerOpen = useAppSelector(selectFrame);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();
  const location = useLocation();

  const menuItems = [
    { targetUrl: '/', IconComponent: HomeIcon, displayText: 'Home' },
    //  { targetUrl: "/comparisons", IconComponent: ListIcon, displayText: "My Comparisons"},
    {
      targetUrl: '/comparison',
      IconComponent: CompareIcon,
      displayText: 'Contribute',
    },
    {
      targetUrl: '/rate_later',
      IconComponent: WatchLaterIcon,
      displayText: 'Rate later',
    },
    {
      targetUrl: '/recommendations',
      IconComponent: VideoLibrary,
      displayText: 'Recommendations',
    },
  ];

  return (
    <Drawer
      variant={isSmallScreen ? 'temporary' : 'permanent'}
      anchor="left"
      open={drawerOpen}
      onClose={() => dispatch(closeDrawer())}
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: drawerOpen,
        [classes.drawerClose]: !drawerOpen,
      })}
      classes={{
        paper: clsx(classes.drawerPaper, {
          [classes.drawerOpen]: drawerOpen,
          [classes.drawerClose]: !drawerOpen,
        }),
      }}
    >
      <List onClick={isSmallScreen ? () => dispatch(closeDrawer()) : undefined}>
        {menuItems.map(({ targetUrl, IconComponent, displayText }) => (
          <ListItem
            key={displayText}
            button
            selected={targetUrl == location.pathname}
            onClick={() => history.push(targetUrl)}
          >
            <ListItemIcon>
              <IconComponent color="action" />
            </ListItemIcon>
            <ListItemText primary={displayText} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SideBar;