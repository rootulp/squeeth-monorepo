import { Button, Tooltip, Typography } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import React from 'react'

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: '300px',
      backgroundColor: 'inherit',
      textAlign: 'left',
      border: `1px solid ${theme.palette.background.stone}`,
      borderRadius: theme.spacing(1),
      padding: theme.spacing(1),
      display: 'flex',
      alignItems: 'flex-end',
      boxSizing: 'border-box',
      justifyContent: 'space-between',
      margin: 'auto',
      '&:focus-within': {
        border: `1px solid ${theme.palette.secondary.main}30`,
      },
    },
    rightContainer: {
      width: '65%',
    },
    actionContainer: {},
    label: {
      color: theme.palette.text.secondary,
    },
    labelContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    tooltipIcon: {
      color: theme.palette.text.hint,
      marginLeft: '6px',
      fontSize: '14px',
    },
    input: {
      border: 'none',
      backgroundColor: 'inherit',
      outline: 'none',
      fontSize: '22px',
      color: theme.palette.text.primary,
      fontWeight: theme.typography.fontWeightBold,
      fontFamily: theme.typography.fontFamily,
    },
    inputContainer: {
      margin: theme.spacing(0.5, 0),
    },
  }),
)

type PrimaryInputType = {
  value: number | string
  onChange: (value: number | string) => void
  label: string
  tooltip?: string
  actionTxt?: string
  onActionClicked?: () => void
}

export const PrimaryInput: React.FC<PrimaryInputType> = ({
  value,
  onChange,
  label,
  tooltip,
  actionTxt,
  onActionClicked,
}) => {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <div className={classes.rightContainer}>
        <div className={classes.labelContainer}>
          <Typography variant="caption" className={classes.label}>
            {label}
          </Typography>
          {tooltip ? (
            <Tooltip title={tooltip}>
              <InfoOutlinedIcon fontSize="small" className={classes.tooltipIcon} />
            </Tooltip>
          ) : null}
        </div>
        <div className={classes.inputContainer}>
          <input
            className={classes.input}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="label"
            type="number"
          ></input>
        </div>
      </div>
      <div className={classes.actionContainer}>
        {actionTxt && onActionClicked ? (
          <Button size="small" color="primary" onClick={onActionClicked}>
            {actionTxt}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
