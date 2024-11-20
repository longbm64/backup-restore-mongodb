const tools = {
    get_code_unique(n) {
        if (!n) {
            n = 8 //default length = 8
        }
        const time = new Date().getTime()
        const random = parseInt(Math.random().toString().split('.')[1])
        const code = (time + random).toString().slice(0, n)
        return code
    },
    modal_edit_value: (value, callback) => {
        const htmlModal = `
        <div class="modal fade" id="modalEditValue">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title">CHỈNH SỬA GIÁ TRỊ</h4>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="text" class="form-control inputValue">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" data-bs-dismiss="modal">Xong</button>
                    </div>
                </div>
            </div>
        </div>
        `
        $('body').append(htmlModal)
        $('#modalEditValue').modal('show')
        $('#modalEditValue').off('shown.bs.modal').on('shown.bs.modal', function () {
            const input = $('#modalEditValue .inputValue').val(value)
            const length = input.val().length
            input.focus()
            input[0].setSelectionRange(length, length)
            input.off('keyup').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    $('#modalEditValue').modal('hide')
                }
            })
        })
        $('#modalEditValue').off('hide.bs.modal').on('hide.bs.modal', function () {
            const input = $('#modalEditValue .inputValue')
            const valueEdited = input.val()
            input.val('')
            callback(valueEdited)
        })
        return

        $('#modalInputModal').off('show.bs.modal').on('show.bs.modal', function () {
            $('#modalInputModal').attr('data-type-close', '')
            $('#modalInputModal_Value').off('keyup').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    $('#modalInputModal').modal('hide')
                }
            })
            if (options.imask === 'number') {
                IMask($('#modalInputModal_Value')[0], {
                    mask: 'num',
                    blocks: {
                        num: {
                            mask: Number,
                            scale: 2,
                            radix: '.',
                        }
                    }
                });
            } else if (options.imask === 'money') {
                IMask($('#modalInputModal_Value')[0], {
                    mask: 'num',
                    blocks: {
                        num: {
                            mask: Number,
                            thousandsSeparator: ','
                        }
                    }
                });
            } else if (options.imask === 'date') {
                IMask($('#modalInputModal_Value')[0], {
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
        })
        $('#modalInputModal .btn-form-save').off('click').on('click', function () {
            $('#modalInputModal').modal('hide')
        })
        $('#modalInputModal .btnClose').off('click').on('click', function () {
            $('#modalInputModal').attr('data-type-close', 'cancel')
        })
        $('#modalInputModal').off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
            if ($('#modalInputModal').attr('data-type-close') === 'cancel') return
            let val = $('#modalInputModal_Value').val().to_number()
            if (options.imask.indexOf('number') > -1 || options.imask.indexOf('money') > -1) {
                val = $('#modalInputModal_Value').val().to_number()
            } else if (options.imask.indexOf('date') > -1) {
                val = $('#modalInputModal_Value').val()
            } else {
                val = $('#modalInputModal_Value').val()
            }
            $('#modalInputModal_Value').val('')
            callback(val)
        })
        $('#modalInputModal').off('hide.bs.modal').on('hide.bs.modal', function (e) {
            setTimeout(function () {
                $('#modalInputModal').remove()
            }, 500)
        })

    }
}