'use strict';

class User {
    constructor(opts = {}) {
        this.id = opts.id || null;
        this.name = opts.name || null;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }
}

class SettingsManager {
    constructor(opts = {}) {
        this.settings = {};
        this.userManagerModal = $(opts.userManagerModal);
        this.createUserModal = $(opts.createUserModal);
        this.user = null;
        this.users = [];
        this.onSettingsLoaded = opts.onSettingsLoaded;
        this.onSettingSaved = opts.onSettingSaved;

        this.userManagerModal.on('show.bs.modal', (e) => {
            this.refreshUserList();
        });

        //this.init();
    }

    init() {
        var switches = document.querySelectorAll('input.custom-switch');
        for(var i=0, sw; sw = switches[i++];){
            var div = document.createElement('div');
            div.className = 'switch';
            div.setAttribute("on-value", sw.getAttribute("on-value"));
            div.setAttribute("off-value", sw.getAttribute("off-value"));
            sw.parentNode.insertBefore(div, sw.nextSibling);
        }

        $.ajax({
            method: 'POST',
            url: 'ajax.php?command=get_user',
            dataType: 'json'
        }).done((data) => {
            if(data.status == 'OK') {
                if(data.user === null) { // The user is not connected or its session has expired
                    $.ajax({
                        method: 'POST',
                        url: 'ajax.php?command=get_users',
                        dataType: 'json'
                    }).done((data) => {
                        $.each(data.users, (key, value) => {
                            let user = new User(value);
                            this.users.push(user);
                        })

                        this.userManagerModal.modal({
                            backdrop: 'static',
                            keyboard: false,
                        }).modal('show');
                    });
                } else { // The user is connected and his session has not expired
                    this.user = new User(data.user);
                    this.postInit();
                }
            }
        });
    }

    postInit() {
        if(this.user === null) return;
        $.ajax({
            method: 'POST',
            url: 'ajax.php?command=get_settings',
            data: {
                user_id: this.user.getId(),
            },
            dataType: 'json'
        }).done((data) => {
            if(data.status == 'OK') {
                $.each(data.settings, (k, setting) => {
                    try {
                        this.settings[setting.key] = JSON.parse(setting.value);
                    } catch (e) {
                        this.settings[setting.key] = setting.value;
                    }
                });

                this.settings['user'] = this.user;

                if(this.onSettingsLoaded) {
                    this.onSettingsLoaded(this.settings);
                }
            }
        });
    }

    addDefaultSettings(settings) {
        $.extend(true, settings, this.settings);
        $.extend(true, this.settings, settings);
    }

    refreshUserList() {
        let ul = $('.userList');
        ul.empty();
        $.each(this.users, (k, user) => {
            let li  = document.createElement('li');
            li.innerHTML = '<button class="btn btn-info btn-lg">'+ user.name +'</button>';
            li.onclick = (e) => { this.loginUser(user); };
            ul.append(li);
        });
    }

    getUser() {
        return this.user;
    }

    loginUser(user) {
        $.ajax({
            method: 'POST',
            url: 'ajax.php?command=login_user',
            data: {
                user_id: user.getId(),
            },
            dataType: 'json'
        }).done((data) => {
            if(data.status == 'OK') {
                this.userManagerModal.modal('hide');
                this.user = user;
                this.postInit();
            }
        });
    }

    saveUserNewName() {
        let userName = $('.userNewNameInput').val();
        let user = new User();
        user.setName(userName);
        $.ajax({
            method: 'POST',
            url: 'ajax.php?command=save_user',
            data: {
                id: user.getId(),
                name: user.getName(),
            },
            dataType: 'json'
        }).done((data) => {
            if(data.status == 'OK') {
                user = new User(data.user);
                this.users.push(user);
                this.refreshUserList();
            }
        });
    }

    get(k) {
        if( this.settings.hasOwnProperty(k) ) {
            return this.settings[k];
        }
        return null;
    }

    set(k, v) {
        this.settings[k] = v;
        this.save(k, v);
    }

    toggle(k) {
        let v = this.get(k);
        if(v === null) v = false; // the setting does not exist, set it by default
        if(typeof(v) !== 'boolean') {
            console.error('Toggling a non-boolean setting is not possible');
            return null;
        }
        v = !v;
        this.set(k, v);
        return v;
    }

    save(k, v) {
        $.ajax({
            method: 'POST',
            url: 'ajax.php?command=set_setting',
            data: {
                key: k,
                value: v,
            },
            dataType: 'json'
        }).done((data) => {
            if(data.status == 'OK') {
                if(this.onSettingSaved) {
                    this.onSettingSaved(data.setting);
                }
            }
        });
    }
}