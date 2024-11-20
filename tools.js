const jwt = require("jsonwebtoken")
const md5 = require("md5")
const sha1 = require("sha1")
const fs = require("fs")
const _ = require('lodash')
const tools = {
    tag_html_decode: (str_html) => {
        let find = '_@@_'
        let re = new RegExp(find, 'g')
        str_html = str_html.replace(re, '<')
        find = '_##_'
        re = new RegExp(find, 'g')
        str_html = str_html.replace(re, '>')
        find = '_!!_'
        re = new RegExp(find, 'g')
        str_html = str_html.replace(re, '/')
        return str_html
    },
    tag_html_encode: (str_html) => {
        return str_html
            .replace(/</g, '_@@_')
            .replace(/>/g, '_##_')
            .replace(/\//g, '_!!_')
    },
    get_cookie: (cookie, cname) => {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1)
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return ""
    },
    check_token: (req) => {
        try {
            let token = req.header('cookie')
            token = tools.get_cookie(token, 'access_token')
            let a = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            return true
        } catch (e) {
            return false
        }
    },
    create_token: (data, expiryDay) => {
        return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
            // expiresIn: "86400s",
            expiresIn: "1d",
        })
    },
    get_info_user_from_token: (req) => {
        try {
            let token = req.header('authorization');
            token = token.split('Bearer ')[1]
            return jwt.verify(token, req.app_register.access_token_secret)
        } catch (e) {
            return false
        }
    },
    format_bytes: (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes'
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    },
    datetime_to_time: (datetime) => {
        if (tools.is_valid_date(datetime)) {
            let a = datetime.split(' ')
            let d = a[0].split('/').reverse().join('-')
            let h = typeof a[1] === 'undefined' ? '' : ' ' + a[1]
            return new Date(`${d}${h}`).getTime()
        } else {
            return `Wrong format, correct is dd/mm/yyyy, ${datetime}`
        }
    },
    datetime_to_time_condition: (datetime, type) => {
        if (tools.is_valid_date(datetime)) {
            let a = datetime.split(' ')
            let d = a[0].split('/').reverse().join('-')
            let h = ''
            if (type === 'start') {
                h = ' 00:00:00'
            } else if (type === 'end') {
                h = ' 23:59:59'
            }
            return new Date(`${d}${h}`).getTime()
        } else {
            return `Wrong format, correct is dd/mm/yyyy`
        }
    },
    format_money: (n) => {
        let x = n.toString();
        if (x === 'undefined' || x === 'null') {
            return 0
        }
        x = parseFloat(x)
        x = x.toLocaleString('it-IT');
        x = x.replace(/\./g, ',')
        return x
    },
    format_number_phone: function (phoneNumberString) {
        var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
        var match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`
        }
        return ''
    },
    format_number_to_text(nnn) {
        var ChuSo = new Array(" không ", " một ", " hai ", " ba ", " bốn ", " năm ", " sáu ", " bảy ", " tám ", " chín ");
        var Tien = new Array("", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ");
        var SoTien = tools.to_number(nnn); //number
        var lan = 0;
        var i = 0;
        var so = 0;
        var KetQua = "";
        var tmp = "";
        var ViTri = new Array();
        if (SoTien < 0) return "Số tiền âm !";
        if (SoTien === 0) return "Không đồng !";
        if (SoTien > 0) {
            so = SoTien;
        } else {
            so = -SoTien;
        }
        if (SoTien > 8999999999999999) {
            //SoTien = 0;
            return "Số quá lớn!";
        }
        ViTri[5] = Math.floor(so / 1000000000000000);
        if (isNaN(ViTri[5]))
            ViTri[5] = "0";
        so = so - parseFloat(ViTri[5].toString()) * 1000000000000000;
        ViTri[4] = Math.floor(so / 1000000000000);
        if (isNaN(ViTri[4]))
            ViTri[4] = "0";
        so = so - parseFloat(ViTri[4].toString()) * 1000000000000;
        ViTri[3] = Math.floor(so / 1000000000);
        if (isNaN(ViTri[3]))
            ViTri[3] = "0";
        so = so - parseFloat(ViTri[3].toString()) * 1000000000;
        ViTri[2] = parseInt(so / 1000000);
        if (isNaN(ViTri[2]))
            ViTri[2] = "0";
        ViTri[1] = parseInt((so % 1000000) / 1000);
        if (isNaN(ViTri[1]))
            ViTri[1] = "0";
        ViTri[0] = parseInt(so % 1000);
        if (isNaN(ViTri[0]))
            ViTri[0] = "0";
        if (ViTri[5] > 0) {
            lan = 5;
        } else if (ViTri[4] > 0) {
            lan = 4;
        } else if (ViTri[3] > 0) {
            lan = 3;
        } else if (ViTri[2] > 0) {
            lan = 2;
        } else if (ViTri[1] > 0) {
            lan = 1;
        } else {
            lan = 0;
        }
        for (i = lan; i >= 0; i--) {
            tmp = tools.read_name_number(ViTri[i]);
            KetQua += tmp;
            if (ViTri[i] > 0) KetQua += Tien[i];
            if ((i > 0) && (tmp.length > 0)) KetQua += ','; //&& (!string.IsNullOrEmpty(tmp))
        }
        if (KetQua.substring(KetQua.length - 1) == ',') {
            KetQua = KetQua.substring(0, KetQua.length - 1);
        }
        KetQua = KetQua.substring(1, 2).toUpperCase() + KetQua.substring(2);
        return (KetQua + ' đồng').replace(/  /g, ' '); //.substring(0, 1);//.toUpperCase();// + KetQua.substring(1);
    },
    format_search_txt: (str) => {
        if (typeof str === 'undefined' || str === null) {
            return ''
        }
        if (Array.isArray(str)) {
            str = str.join('')
        }
        str = str.toLowerCase()
        str = tools.remove_vietnam_accents(str)
        str = str
            .replace(/ /g, '')
            .replace(/,/g, '')
            .replace(/-/g, '')
            .replace(/_/g, '')
            .replace(/\./g, '')
            .replace(/"/g, '')
            .replace(/'/g, '')
            .replace(/\`/g, '')
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .replace(/\{/g, '')
            .replace(/\}/g, '')
            .replace(/\[/g, '')
            .replace(/\]/g, '')
        return str
    },
    format_to_json: (obj) => {
        obj = JSON.stringify(obj)
        return JSON.parse(obj)
    },
    get_code_unique(n) {
        if (!n) {
            n = 8 //default length = 8
        }
        const time = new Date().getTime()
        const random = parseInt(Math.random().toString().split('.')[1])
        const code = (time + random).toString().slice(0, n)
        return code
    },
    get_error_try_catch: (e) => {
        if (e.message.toString().indexOf('duplicate') > -1) {
            let t = e.message.split('dup key:')[1].trim()
            t = tools.format_to_json(t)
            let info = []
            if (t.indexOf('name') > -1) {
                info.push('Tên đã tồn tại')
            } else if (t.indexOf('phone') > -1) {
                info.push('Số điện thoại đã tồn tại')
            }
            return {
                code: 500,
                status: "error",
                message: info
            }
        } else {
            return {
                code: 500,
                status: "error",
                message: `Lỗi không xác định, ${e.message}`
            }
        }
    },
    get_first_last_day_in_month: (month) => {
        let time = tools.datetime_to_time(`01/${month}`)
        let date = new Date(time)
        let m = ('0' + (date.getMonth() + 1)).slice(-2)
        let y = date.getFullYear()
        let f = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        let first = `01/${m}/${y} 00:00:00`
        let last = `${f.getDate()}/${m}/${y} 23:59:59`
        return {
            first: first,
            last: last
        }
    },
    get_time() {
        return new Date().getTime()
    },
    get_total_day_in_month: (time) => {
        let date = new Date(time)
        let d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        return d.getDate()
    },
    image_to_base64: async (file) => {
        var bitmap = fs.readFileSync(file);
        return new Buffer(bitmap).toString('base64');
    },
    is_valid_date: (s) => {
        if (!s) {
            return s
        }
        s = s.toString()
        const regex_date = /^\d{2}\/\d{2}\/\d{4}$/;
        if (regex_date.test(s)) {
            // format dd/mm/yyyy
            s = s.split('/').reverse().join('/')
            const d = new Date(s);
            const parts = s.split('/').map((p) => parseInt(p, 10));
            return d.getDate() === parts[2] && d.getMonth() + 1 === parts[1] && d.getFullYear() === parts[0]
        } else {
            const regex_datetime = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;
            if (regex_datetime.test(s)) {
                // format dd/mm/yyyy hh:mm:ss
                let a = s.split(' ')
                let date = a[0].split('/').reverse().join('/')
                let hour = a[1]
                const d = new Date(`${date} ${hour}`);
                const parts_date = date.split('/').map((p) => parseInt(p, 10));
                const parts_hour = hour.split(':').map((p) => parseInt(p, 10));
                return d.getDate() === parts_date[2]
                    && d.getMonth() + 1 === parts_date[1]
                    && d.getFullYear() === parts_date[0]
                    && parts_hour[0] === d.getHours()
                    && parts_hour[1] === d.getMinutes()
                    && parts_hour[2] === d.getSeconds()
            } else {
                return false
            }
        }
    },
    pagination: (data, query) => {
        if (query.limit && query.page) {
            query.limit = parseInt(query.limit)
            query.limit = isNaN(query.limit) ? 0 : query.limit
            query.page = parseInt(query.page)
            query.page = isNaN(query.page) ? 0 : query.page

            query.total_item = data.length

            query.total_page = Math.ceil(query.total_item / query.limit)
            query.total_page = isNaN(query.total_page) ? 0 : query.total_page

            if (query.page <= 0 || query.page > query.total_page) {
                return {
                    code: 406,
                    status: 'error',
                    message: 'Số trang (Page) không hợp lệ',
                    data: [],
                    pagination: {
                        limit: query.limit ?? 0,
                        page: query.page ?? 0,
                        total_item: query.total_item ?? 0,
                        total_page: query.total_page ?? 0,
                    },
                }
            }
            let array = _.chunk(data, query.limit === 0 ? data.length : query.limit);
            return {
                data: array[query.page - 1] ?? [],
                pagination: {
                    limit: query.limit ?? 0,
                    page: query.page ?? 0,
                    total_item: query.total_item ?? 0,
                    total_page: query.total_page ?? 0,
                },
            }
        } else {
            return {
                data: data,
                pagination: {
                    limit: 0,
                    page: 0,
                    total_item: 0,
                    total_page: 0,
                },
            }
        }
    },
    password_encode: (str) => {
        return md5(sha1(sha1(md5(sha1(md5(md5(sha1(str))))))))
    },
    read_name_number: (baso) => {
        var ChuSo = new Array(" không ", " một ", " hai ", " ba ", " bốn ", " năm ", " sáu ", " bảy ", " tám ", " chín ");
        var Tien = new Array("", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ");

        var tram;
        var chuc;
        var donvi;
        var KetQua = "";
        tram = parseInt(baso / 100);
        chuc = parseInt((baso % 100) / 10);
        donvi = baso % 10;
        if (tram == 0 && chuc == 0 && donvi == 0) return "";
        if (tram != 0) {
            KetQua += ChuSo[tram] + " trăm ";
            if ((chuc == 0) && (donvi != 0)) KetQua += " linh ";
        }
        if ((chuc != 0) && (chuc != 1)) {
            KetQua += ChuSo[chuc] + " mươi";
            if ((chuc == 0) && (donvi != 0)) KetQua = KetQua + " linh ";
        }
        if (chuc == 1) KetQua += " mười ";
        switch (donvi) {
            case 1:
                if ((chuc != 0) && (chuc != 1)) {
                    KetQua += " mốt ";
                } else {
                    KetQua += ChuSo[donvi];
                }
                break;
            case 5:
                if (chuc == 0) {
                    KetQua += ChuSo[donvi];
                } else {
                    KetQua += " lăm ";
                }
                break;
            default:
                if (donvi != 0) {
                    KetQua += ChuSo[donvi];
                }
                break;
        }
        return KetQua;
    },
    remove_format_money: (n) => {
        let val = n.toString()
        let isA = val[0] === '-' ? true : false
        val = val.replace(/\D/g, '')
        return isA ? parseFloat(val) * -1 : parseFloat(val)
    },
    remove_vietnam_accents: (str) => {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        return str;
    },
    time_to_datetime: (time, haveTime) => {
        time = parseInt(time)
        const dt = new Date(time)
        const y = dt.getFullYear()
        const m = ('0' + (dt.getMonth() + 1)).slice(-2)
        const d = ('0' + dt.getDate()).slice(-2)
        const h = ('0' + dt.getHours()).slice(-2)
        const i = ('0' + dt.getMinutes()).slice(-2)
        const s = ('0' + dt.getSeconds()).slice(-2)
        let str = ``
        if (haveTime) {
            str = `${d}/${m}/${y} ${h}:${i}:${s}`
        } else {
            str = `${d}/${m}/${y}`
        }
        str = str.indexOf('aN') > -1 ? `Không xác định` : str
        return str
    },
    to_number: (n) => {
        let x = n.toString();
        if (x === 'undefined' || x === 'null' || x === '') {
            return 0
        }
        x = tools.remove_format_money(x)
        return x
    },
}
module.exports = tools