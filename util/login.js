const app_info  = {
	id: 'wx90ea28954658601b',
	secret: 'f0a575b6c2dfddab4c982b065bb70255'
}
const url = {
	login: 'https://dapi.mepai.me/v1/ologin'
}
function login ( app, nickname ) {
    var device_token = wx.getSystemInfoSync().system;

    var obj = {
        access_token: '', // code
        platform:  'wx_xcx',
        platform_id: 'kuaipai',
        device_type: 'wx_xcx',
        device_token: device_token,
        nickname: '',

        sign: '',
        raw: '',
        encrypt: '',
        iv: ''
    };

    // 用户登录
    const login = app.api.login;
    const request = app.api.request;
    const getUserInfo = app.api.getUserInfo;
    const setStorage = app.api.setStorage;

    return login().then((res) => {
        // 获取code
        let code = res.code;

        return new Promise(function ( resolve, reject ) {
            if ( code ) {
                resolve(code);
            }
            else {
                reject(res)
            }
        });
    }, ( err ) => {
        wx.showToast({
            title: '微信登录失败'
        });
    }).then(( code ) => {
        obj.access_token = code;

        // 获取用户信息
        getUserInfo().then((res) => {
            if ( nickname ) {
                obj.nickname = nickname;
            }
            else {
                obj.nickname = res.userInfo.nickName;
            }
            obj.sign = res.signature;
            obj.raw = res.rawData;
            obj.encrypt = res.encryptedData;
            obj.iv = res.iv;
            
            return Promise.resolve(obj);
        }, ( err ) => {
            return Promise.reject(err);
        }).then(( obj ) => {

            // 登录米拍
            request({
                url: url.login,
                method: 'post', 
                data: obj
            }).then(res => {
                var code = res.data.code;

                if ( code == 200012 || code == 100111 || code == 200011 ) {
                    return Promise.reject(res);
                }
                else if ( code != 100001 ){
                    return Promise.reject(res);
                }
                else {
                    return Promise.resolve(res);
                }
            }, err => {
                return Promise.reject(err);
            }).then(res => {
                // 缓存登录验证数据
                setStorage({
                    key: 'user',
                    data: res.data.data
                });

            }, err => {
                console.log(err);
                var code = err.data.code;

                if ( code && code == 200012 || code == 100111 || code == 200011) {
                    setStorage({
                        key: 'user',
                        data: 200012
                    });
                };
            });

        }, err => {
            console.log(err);
        });
    }, ( err ) => {
        console.log(err);
    });
}
export default login;