import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { _mapStateToProps, AbstractWelcomePage } from './AbstractWelcomePage';


// eslint-disable-next-line require-jsdoc
class SignInComponent extends AbstractWelcomePage {
    // eslint-disable-next-line require-jsdoc
    Copyright() {
        return (
            <Typography
                align = 'center'
                color = 'textSecondary'
                variant = 'body2'>
                {'Copyright © '}
                <Link
                    color = 'inherit'
                    href = 'https://material-ui.com/'>
                    Virtual Classroom WebApp
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography>
        );
    }
    // eslint-disable-next-line require-jsdoc
    useStyles() {
        makeStyles(theme => {
            return {
                paper: {
                    marginTop: theme.spacing(8),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                },
                avatar: {
                    margin: theme.spacing(1),
                    backgroundColor: theme.palette.secondary.main
                },
                form: {
                    width: '100%', // Fix IE 11 issue.
                    marginTop: theme.spacing(1)
                },
                submit: {
                    margin: theme.spacing(3, 0, 2)
                }
            };
        });
    }


    // eslint-disable-next-line require-jsdoc
    render() {
        const classes = this.useStyles();

        return (
            <Container
                component = 'main'
                maxWidth = 'xs'>
                <CssBaseline />
                <div className = { classes.paper }>
                    <Avatar className = { classes.avatar }>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography
                        component = 'h1'
                        variant = 'h5'>
                        Sign in
                    </Typography>
                    <form
                        className = { classes.form }
                        noValidate = { true }>
                        <TextField
                            autoComplete = 'email'
                            autoFocus = { true }
                            fullWidth = { true }
                            id = 'email'
                            label = 'Email Address'
                            margin = 'normal'
                            name = 'email'
                            required = { true }
                            variant = 'outlined' />
                        <TextField
                            autoComplete = 'current-password'
                            fullWidth = { true }
                            id = 'password'
                            label = 'Password'
                            margin = 'normal'
                            name = 'password'
                            required = { true }
                            type = 'password'
                            variant = 'outlined' />
                        <FormControlLabel
                            control = { <Checkbox
                                color = 'primary'
                                value = 'remember' /> }
                            label = 'Remember me' />
                        <Button
                            className = { classes.submit }
                            color = 'primary'
                            fullWidth = { true }
                            type = 'submit'
                            variant = 'contained'>
                            Sign In
                        </Button>
                        <Grid container = { true }>
                            <Grid
                                item = { true }
                                xs = { true }>
                                <Link
                                    href = '#'
                                    variant = 'body2'>
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item = { true }>
                                <Link
                                    href = '#'
                                    variant = 'body2'>
                                    {'Don\'t have an account? Sign Up'}
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </div>
                <Box mt = { 8 }>
                    <this.Copyright />
                </Box>
            </Container>
        );
    }
}
export default translate(connect(_mapStateToProps)(SignInComponent));
