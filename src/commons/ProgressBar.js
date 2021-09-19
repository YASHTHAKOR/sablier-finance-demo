import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    width: '55%',
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
    },
}));

const BoxProgress = styled(Box)((theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
}))

function LinearProgressBar ({value}) {
    return  <BoxProgress sx={{ flexGrow: 2 }}>
        <BorderLinearProgress variant="determinate" value={value} />
        <span style={{float: 'left'}}>{value} %</span>
    </BoxProgress>
}

export default LinearProgressBar;
