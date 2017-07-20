const login = require('../../util/login');
const app = getApp();

var value;
function getNickName ( e ) {
    value = e.detail.value;
}
function changeNickName () {
    var nickname = value;
    var is_verify = verifyNickName( nickname );
    var _this = this;

    if ( is_verify ) {
        login(app, nickname).then(res => {
            _this.setData({
                dialog: true
            });
        });
    }
}
function verifyNickName ( value ) {
    if ( typeof value == 'string' ) {
        var value = value.trim();
        var len = value.length;
        var reg = /^[\u4e00-\u9fa5_a-zA-Z0-9-]+$/;

        // 字数限制为4-14
        if ( len < 4 || len > 10 ) {
            wx.showToast({
                title: '字数必须在4-10个字以内'
            });
            return false;
        };

        // 名称格式验证
        if ( !reg.test( value ) ) {
            wx.showToast({
                title: '昵称只能由中文,英文,数字,下划线_,减号-,组成'
            });
            return false;
        };
        
        return true;
    };
}

export default {
    getNickName: getNickName,
    changeNickName: changeNickName
}