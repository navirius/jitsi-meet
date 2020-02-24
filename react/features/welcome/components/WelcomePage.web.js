/* global interfaceConfig */

import React from 'react';

import { translate } from '../../base/i18n';
import { Watermarks } from '../../base/react';
import { connect } from '../../base/redux';
import { isMobileBrowser } from '../../base/environment/utils';
import { CalendarList } from '../../calendar-sync';
import { RecentList } from '../../recent-list';
import { SettingsButton, SETTINGS_TABS } from '../../settings';

import { AbstractWelcomePage, _mapStateToProps } from './AbstractWelcomePage';
import Tabs from './Tabs';
import Websocket from 'react-websocket';

/**
 * The pattern used to validate room name.
 * @type {string}
 */
export const ROOM_NAME_VALIDATE_PATTERN_STR = '^[^?&:\u0022\u0027%#]+$';

/**
 * Maximum number of pixels corresponding to a mobile layout.
 * @type {number}
 */
const WINDOW_WIDTH_THRESHOLD = 425;

/**
 * The Web container rendering the welcome page.
 *
 * @extends AbstractWelcomePage
 */
class WelcomePage extends AbstractWelcomePage {
    /**
     * Default values for {@code WelcomePage} component's properties.
     *
     * @static
     */
    static defaultProps = {
        _room: ''
    };

    /**
     * Initializes a new WelcomePage instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,

            generateRoomnames: interfaceConfig.GENERATE_ROOMNAMES_ON_WELCOME_PAGE,
            selectedTab: 0,
        };

        this.username = '';
        this.password = '';
        /**
         * The HTML Element used as the container for additional content. Used
         * for directly appending the additional content template to the dom.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentRef = null;

        this._roomInputRef = null;
        this._usernameInputRef = null;
        this._passwordInputRef = null;

        /**
         * The HTML Element used as the container for additional toolbar content. Used
         * for directly appending the additional content template to the dom.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalToolbarContentRef = null;

        /**
         * The template to use as the main content for the welcome page. If
         * not found then only the welcome page head will display.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentTemplate = document.getElementById(
            'welcome-page-additional-content-template');

        /**
         * The template to use as the additional content for the welcome page header toolbar.
         * If not found then only the settings icon will be displayed.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalToolbarContentTemplate = document.getElementById(
            'settings-toolbar-additional-content-template'
        );

        // Bind event handlers so they are only bound once per instance.
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this._onRoomChange = this._onRoomChange.bind(this);
        this._onLoginSubmit = this._onLoginSubmit.bind(this);
        this._onUsernameChanged = this._onUsernameChanged.bind(this);
        this._setAdditionalContentRef
            = this._setAdditionalContentRef.bind(this);
        this._setRoomInputRef = this._setRoomInputRef.bind(this);
        this._setUsernameInputRef = this._setUsernameInputRef.bind(this);
        this._setAdditionalToolbarContentRef
            = this._setAdditionalToolbarContentRef.bind(this);
        this._onTabSelected = this._onTabSelected.bind(this);
        this.getClassroomFromServer = this.getClassroomFromServer.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}. Invoked
     * immediately after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        super.componentDidMount();

        document.body.classList.add('welcome-page');
        document.title = interfaceConfig.APP_NAME;

        if (this.state.generateRoomnames) {
            this._updateRoomname();
        }

        if (this._shouldShowAdditionalContent()) {
            this._additionalContentRef.appendChild(
                this._additionalContentTemplate.content.cloneNode(true));
        }

        if (this._shouldShowAdditionalToolbarContent()) {
            this._additionalToolbarContentRef.appendChild(
                this._additionalToolbarContentTemplate.content.cloneNode(true)
            );
        }
    }

    /**
     * Removes the classname used for custom styling of the welcome page.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        super.componentWillUnmount();

        document.body.classList.remove('welcome-page');
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement|null}
     */
    render() {
        const { t } = this.props;
        const { APP_NAME } = interfaceConfig;
        const showAdditionalContent = this._shouldShowAdditionalContent();
        const showAdditionalToolbarContent = this._shouldShowAdditionalToolbarContent();
        const showResponsiveText = this._shouldShowResponsiveText();

        return (
            <div
                className = { `welcome ${showAdditionalContent
                    ? 'with-content' : 'without-content'}` }
                id = 'welcome_page'>
                <div
                    className = 'welcome-watermark'>
                    <Watermarks />
                </div>
                <div className = 'header'>
                    <div className = 'welcome-page-settings'>
                        <SettingsButton
                            defaultTab = { SETTINGS_TABS.CALENDAR } />
                        { showAdditionalToolbarContent
                            ? <div
                                className = 'settings-toolbar-content'
                                ref = { this._setAdditionalToolbarContentRef } />
                            : null
                        }
                    </div>
                    <div className = 'header-image' />
                    <div className = 'header-text'>
                        <h1 className = 'header-text-title'>
                            { t('welcomepage.title') }
                        </h1>
                        <p className = 'header-text-description'>
                            { t('welcomepage.appDescription',
                                { app: APP_NAME }) }
                        </p>
                    </div>
                    <div
                        id = 'login_div'>
                        <div
                            className = 'enter-room-input-container'>
                            { t('welcomepage.enterLogin')}
                        </div>
                        <form onSubmit = { this._onLoginSubmit }>
                            <label>Login Name : </label>
                            <input
                                autoFocus = { true }
                                className = 'enter-room-input'
                                id = 'username_field'
                                onChange = { this._onUsernameChanged }
                                pattern = { ROOM_NAME_VALIDATE_PATTERN_STR }
                                placeholder = { this.state.loginPlaceholder }
                                ref = { this._setUsernameInputRef }
                                title = 'Login Name'
                                type = 'text'
                                value = { this.state.username } />
                            <br />
                            {/*<label>Password</label>*/}
                            {/*<input*/}
                            {/*    autoFocus = { true }*/}
                            {/*    className = 'enter-room-input'*/}
                            {/*    id = 'password_field'*/}
                            {/*    onChange = { this._onPasswordChanged }*/}
                            {/*    pattern = { ROOM_NAME_VALIDATE_PATTERN_STR }*/}
                            {/*    placeholder = { this.state.loginPlaceholder }*/}
                            {/*    title = 'Password'*/}
                            {/*    type = 'password'*/}
                            {/*    value = { this.state.password } />*/}
                        </form>
                    </div>
                    <div
                        className = 'welcome-page-button'
                        id = 'login_button'
                        onClick = { this._onLoginSubmit }>
                        {
                            showResponsiveText
                                ? t('welcomepage.goSmall')
                                : t('welcomepage.go')
                        }
                    </div>
                    {
                        this._renderDefault()
                    }
                </div>
                { showAdditionalContent
                    ? <div
                        className = 'welcome-page-content'
                        ref = { this._setAdditionalContentRef } />
                    : null }
            </div>
        );
    }

    // eslint-disable-next-line require-jsdoc
    _renderDefault() {
        if (this.state.isLogined) {
            this._renderRoomName();
            this._renderTabs();
        }
    }
    // eslint-disable-next-line require-jsdoc,no-empty-function
    _renderRoomName() {
        const { t } = this.props;
        const showResponsiveText = this._shouldShowResponsiveText();

        return (
            <div
                id = 'enter_room' >
                <div className = 'enter-room-input-container'>
                    <div className = 'enter-room-title'>
                        { t('welcomepage.enterRoomTitle') }
                    </div>
                    <form onSubmit = { this._onFormSubmit }>
                        <input
                            autoFocus = { true }
                            className = 'enter-room-input'
                            id = 'enter_room_field'
                            onChange = { this._onRoomChange }
                            pattern = { ROOM_NAME_VALIDATE_PATTERN_STR }
                            placeholder = { this.state.roomPlaceholder }
                            ref = { this._setRoomInputRef }
                            title = { t('welcomepage.roomNameAllowedChars') }
                            type = 'text'
                            value = { this.state.room } />
                    </form>
                </div>
                <div
                    className = 'welcome-page-button'
                    id = 'enter_room_button'
                    onClick = { this._onFormSubmit }>
                    {
                        showResponsiveText
                            ? t('welcomepage.goSmall')
                            : t('welcomepage.go')
                    }
                </div>
                {/*<div>*/}
                {/*    <Websocket*/}
                {/*        debug = {true}*/}
                {/*        onClose = {this.handleClose}*/}
                {/*        onMessage = {this.handleData}*/}
                {/*        onOpen = {this.handleOpen}*/}
                {/*        reconnect = {true}*/}
                {/*        ref={Websocket => {*/}
                {/*            this.refWebSocket = Websocket;*/}
                {/*        }}*/}
                {/*        url = 'wss://vps.ranonline.co.id:8443' />*/}
                {/*</div>*/}
            </div>
        );
    }

    handleClose() {
        console.log('Websocket close connection')
    }

    handleOpen() {
        console.log('Websocket open connection')
    }
    sendJsonMessage(jsonData) {
        this.refWebSocket.sendMessage(jsonData);
    }
    // eslint-disable-next-line require-jsdoc
    handleData(data) {
        // eslint-disable-next-line eqeqeq
        if (data === null) {
            return;
        }

        const result = JSON.parse(data);

        if (result === null) {
            return;
        }
        if (result.MessageType === 'LOGIN_FB') {
            if (result.LoginResult === 'OK') {

            }
        }
        else if (result.MessageType === 'CONNECT') {
            let classroomId = result.ClassroomId;
            let userName = result.UserName;
            classroomId = classroomId.replace(/-/g, '');
            this.state.room = classroomId + '?username = ' + userName;
            this._onJoin();
        }
    }

    // eslint-disable-next-line require-jsdoc
    _onUsernameChanged(event) {
        super._onUsernameChanged(event.target.value);
    }
    // eslint-disable-next-line require-jsdoc
    _onPasswordChanged(event) {
        if (this === 'undefined')
            return;
        //this.setState({ password: event.target.value });
        this.state.password = event.target.value;
    }
    // eslint-disable-next-line require-jsdoc
    async _onLoginSubmit() {
        if (this.state.username.length === 0) {
            alert('UserName can not empty');

            return;
        }

        let classroomIdRequestModel = {};
        classroomIdRequestModel.userIdRequest = this.state.username;
        await this.getClassroomFromServer(classroomIdRequestModel)
        // if (this.state.password.length === 0) {
        //     alert('Password can not empty');
        //
        //     return;
        // }

        // let loginMsg = {
        //     MessageType: 'LOGIN',
        //     UserType: 'TEACHER',
        //     UserId: this.state.username,
        //     UserName: this.state.username,
        //     UserPassword: this.state.username
        // }
        //
        // let loginJson = JSON.stringify(loginMsg);
        // this.sendJsonMessage(loginJson);
    }

    async getClassroomFromServer(classroomIdRequestModel)
    {
        const response = await fetch('https://178.128.50.99:5443/get-classroom-id', {
            method: 'POST',
            body: JSON.stringify(classroomIdRequestModel),
            headers: { "Content-type": "application/json; charset=UTF-8" },
        });

        const responseJson = await response.json();
        console.log("receive reply from API " + responseJson);
        //let responseModel = JSON.parse(responseJson);
        let classroomId = responseJson.classroomId;
        let classroomIdParsed =  classroomId.replace(/-/g, "");
        this.state.username = responseJson.userIdRequest;
        this.state.room = classroomIdParsed;
        this.state.generatedRoomname = classroomIdParsed;
        this._onJoin();
    }
    /**
     * Prevents submission of the form and delegates join logic.
     *
     * @param {Event} event - The HTML Event which details the form submission.
     * @private
     * @returns {void}
     */
    _onFormSubmit(event) {
        event.preventDefault();

        if (!this._roomInputRef || this._roomInputRef.reportValidity()) {
            this._onJoin();
        }
    }

    /**
     * Overrides the super to account for the differences in the argument types
     * provided by HTML and React Native text inputs.
     *
     * @inheritdoc
     * @override
     * @param {Event} event - The (HTML) Event which details the change such as
     * the EventTarget.
     * @protected
     */
    _onRoomChange(event) {
        super._onRoomChange(event.target.value);
    }

    /**
     * Callback invoked when the desired tab to display should be changed.
     *
     * @param {number} tabIndex - The index of the tab within the array of
     * displayed tabs.
     * @private
     * @returns {void}
     */
    _onTabSelected(tabIndex) {
        this.setState({ selectedTab: tabIndex });
    }

    /**
     * Renders tabs to show previous meetings and upcoming calendar events. The
     * tabs are purposefully hidden on mobile browsers.
     *
     * @returns {ReactElement|null}
     */
    _renderTabs() {
        if (isMobileBrowser()) {
            return null;
        }

        const { _calendarEnabled, t } = this.props;

        const tabs = [];

        if (_calendarEnabled) {
            tabs.push({
                label: t('welcomepage.calendar'),
                content: <CalendarList />
            });
        }

        tabs.push({
            label: t('welcomepage.recentList'),
            content: <RecentList />
        });

        return (
            <Tabs
                onSelect = { this._onTabSelected }
                selected = { this.state.selectedTab }
                tabs = { tabs } />);
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * welcome page content.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the welcome page content.
     * @private
     * @returns {void}
     */
    _setAdditionalContentRef(el) {
        this._additionalContentRef = el;
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * toolbar additional content.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the additional toolbar content.
     * @private
     * @returns {void}
     */
    _setAdditionalToolbarContentRef(el) {
        this._additionalToolbarContentRef = el;
    }

    _setUsernameInputRef(el) {
        this._usernameInputRef = el;
    }
    /**
     * Sets the internal reference to the HTMLInputElement used to hold the
     * welcome page input room element.
     *
     * @param {HTMLInputElement} el - The HTMLElement for the input of the room name on the welcome page.
     * @private
     * @returns {void}
     */
    _setRoomInputRef(el) {
        this._roomInputRef = el;
    }

    /**
     * Returns whether or not additional content should be displayed below
     * the welcome page's header for entering a room name.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalContent() {
        return interfaceConfig.DISPLAY_WELCOME_PAGE_CONTENT
            && this._additionalContentTemplate
            && this._additionalContentTemplate.content
            && this._additionalContentTemplate.innerHTML.trim();
    }

    /**
     * Returns whether or not additional content should be displayed inside
     * the header toolbar.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalToolbarContent() {
        return interfaceConfig.DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT
            && this._additionalToolbarContentTemplate
            && this._additionalToolbarContentTemplate.content
            && this._additionalToolbarContentTemplate.innerHTML.trim();
    }

    /**
     * Returns whether or not the screen has a size smaller than a custom margin
     * and therefore display different text in the go button.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowResponsiveText() {
        const { innerWidth } = window;

        return innerWidth <= WINDOW_WIDTH_THRESHOLD;
    }

}

export default translate(connect(_mapStateToProps)(WelcomePage));
