/*!
    * Start Bootstrap - SB Admin v7.0.7 (https://startbootstrap.com/template/sb-admin)
    * Copyright 2013-2023 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
    */
// 
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});

$('form').on('submit', function (e) {
    e.preventDefault()
})
// $('input').on('input', function () {
//     let $this = $(this)
//     if ($this.attr('imask') === 'month') return
//     if ($this.attr('imask') === 'date') return
//     if ($this.attr('imask') === 'money') {
//         let a = $this.val().remove_format_money()
//         $this.val(a)
//         return
//     }
//     if ($this.attr('imask') === 'number') {
//         let a = $this.val()
//         $this.val(a)
//         return
//     }
//     if ($this.attr('imask') === 'phone') return
// })
$('input').map(function () {
    let $this = $(this)
    let idElement = $this.attr('id')
    let valueElement = localStorage.getItem(idElement)
    let rememberValue = parseInt($this.attr('rememberValue')) === 1
    if (rememberValue) {
        $(`#${idElement}`).val(valueElement)
    }
    if ($this.attr('imask') === 'phone') {
        IMask($this[0], { mask: "0000-000-000" });
    }
    if ($this.attr('imask') === 'money') {
        IMask($this[0], {
            mask: 'num',
            blocks: {
                num: {
                    mask: Number,
                    thousandsSeparator: ','
                }
            }
        });
    }
    if ($this.attr('imask') === 'date') {
        IMask($this[0], {
            mask: Date,
            pattern: 'd{/}`m{/}`Y',
            format: function (date) {
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();

                if (day < 10) day = "0" + day;
                if (month < 10) month = "0" + month;

                return [day, month, year].join('/');
            },
            parse: function (str) {
                var yearMonthDay = str.split('/');
                var date = new Date(yearMonthDay[2], yearMonthDay[1] - 1, yearMonthDay[0])
                return date;
            },
            lazy: false,
        });
    }
    if ($this.attr('imask') === 'number') {
        IMask($this[0], {
            mask: 'num',
            blocks: {
                num: {
                    mask: Number,
                    scale: 2,
                    radix: '.',
                }
            }
        });
    }
    if ($this.attr('imask') === 'month') {
        IMask($this[0], {
            mask: Date,
            pattern: '`m{/}`Y',
            format: function (date) {
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();

                if (day < 10) day = "0" + day;
                if (month < 10) month = "0" + month;
                return [day, month, year].join('/');
            },
            parse: function (str) {
                var yearMonthDay = str.split('/');
                var date = new Date(yearMonthDay[1], yearMonthDay[0] - 1, 1)
                return date;
            },
            lazy: false,
        });
    }
})
$('#btnLogout').on('click', function () {
    localStorage.removeItem('info_user')
    document.cookie = "access_token=;expires=;path=/";
    window.location.href = '/admin/login'
})
$('#btnUpdateWebsite').on('click', async function () {
    Swal.fire({
        title: "Đang cập nhật...",
        didOpen: async () => {
            Swal.showLoading()
            const result = await $.ajax({
                url: '/admin/update-web',
                type: 'get'
            })
            if (result.status) {
                Swal.hideLoading()
                // Swal.fire("OK")
                Swal.fire({
                    icon: "success",
                    title: "Đã cập nhật phiên bản mới nhất!",
                    showConfirmButton: true,
                })
            } else {
                Swal.fire({
                    icon: "error",
                    title: result.message,
                    showConfirmButton: true,
                });
            }
        },
    })

})