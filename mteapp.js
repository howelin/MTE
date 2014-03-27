/**
 * @Copyright (c) 2014,Tencent Inc. All rights reserved.
 * @update $Id: mteapp.js 16370 2014-03-17 12:18:31Z samgui $
 */

/**
 * MTE全局变量
 */
var MTE = MTE || {};

MTE.locals = {
    please_input_receiver: '请输入接受关注的用户 / 邮件组'
}

/**
 * 初始化
 */
MTE.platform = {
    init: function () {
        MTE.api.load(1);

        // 水印
        $('#receiverValue').attr('placeholder', MTE.locals.please_input_receiver);

        // 搜索
        $('.search_form .ui_form_button').click(function () {
            MTE.api.create();
            return false;
        });

        // 搜索
        $('.ui_form .ui_form_button').click(function () {
            MTE.api.load(1);
        });

        // 编辑
        $('.lnk_edit').click(function () {
            var id = $(this).data('id');
            MTE.api.edit(id);
        });

        // 删除
        $('.lnk_destory').click(function () {
            var id = $(this).data('id');
            MTE.api.destory(id);
        });
    }
}

MTE.webapp = {
    init: function () {
        $('.btn_list').click(function () {
            $('body').toggleClass('list_view');
        });

        $('.icon_star').click(function () {
            $(this).parents('.project').toggleClass('starred');
            return false;
        });

        $('.icon_search').click(function () {
            $('body').addClass('filter_blur');
            $('.txt_search').focus();
        });

        $('.lnk_cancel').click(function () {
            $('body').removeClass('filter_blur');
        });
    }
}
/**
 * 工具函数
 */
MTE.helper = {
    /**
     * 拼装url
     * @param url
     * @returns {string}
     */
    url: function (url) {
        return 'http://d9.oa.com/mteapp/' + url;
    },
    /**
     * 粘贴图像并获取数据，仅 Chrome 支持
     * @param ev
     * @param callback
     * @returns {boolean}
     */
    paste: function (ev, callback) {
        var clipboardData, items, item;

        // 判断剪贴板中是否有图片
        if (ev && (clipboardData = ev.clipboardData)
            && (items = clipboardData.items)
            && (item = items[0])
            && item.kind == 'file'
            && item.type.match(/^image\//i)) {
            var blob = item.getAsFile(), reader = new FileReader();

            reader.onload = function () {
                callback && callback(event.target.result);
            };

            reader.readAsDataURL(blob);
            return false;
        }
    }
}

MTE.api = {
    async: function (d) {
        var url = d.url || '',
            type = d.type || 'GET',
            data = d.data || {},
            cache = d.cache || false,
            dataType = d.dataType || 'json',
            success = d.success,
            error = d.error;

        $.ajax({
            url: MTE.helper.url(url),
            type: type,
            data: data,
            cache: cache,
            dataType: dataType,
            success: function (result) {
                success && success(result);
            },
            error: function () {
                error && error();
            }
        });
    },
    edit: function (id) {
        MTE.api.async({
            url: 'edit/' + id,
            data: {  _: (+new Date)},
            success: function (data) {
                var proj = data.projects;
                $('#name').val(proj.name);
                $('.ui_form_radio[value="' + proj.tag + '"]').attr('checked', true);
                $('#image').val(proj.image);
                $('#url').val(proj.url);
                $('#receiverValue,#receiver').val(proj.receiver);
                $('#remark').val(proj.remark);
                $('.ui_form').attr('action', 'update/' + id);
            }
        });
    },
    create: function () {
        MTE.api.async({
            url: 'create/',
            method: 'POST',
            data: $('.ui_form').serialize(),
            success: function (data) {
                if (data.state == 1) {
                    MTE.api.load(1);
                }
            }
        });
    },
    destory: function (id) {
        MTE.api.async({
            url: 'destory/' + id,
            data: {  _: (+new Date)},
            success: function (data) {
                if (data.state == 1) {
                    MTE.api.load(1);
                }
            }
        });
    },
    load: function (pageIndex) {
        var keyword = $.trim($('.ui_form_input').val());

        MTE.api.async({
            url: 'load',
            data: {keyword: keyword, page: pageIndex, _: (+new Date)},
            success: function (data) {
                var html = '', projects = data.projects;

                if (projects.length > 0) {
                    $.each(projects, function (index, project) {
                        html += '<tr>\
                                    <td class="name">\
                                        <a href="' + project.url + '" target="_blank">' + project.name + '</a>\
                                    </td>\
                                    <td class="tag">' + (project.tag == '0' ? '项目' : '组件') + '</td>\
                                    <td class="photo"><img src="' + project.image + '"></td>\
                                    <td class="qrcode">\
                                        <a class="ui_qrcode_wrapper">\
                                            <img src="http://d9.oa.com/mteapp/img/qrcode.png" width="30" class="icon_qrcode"><img src="http://chart.googleapis.com/chart?cht=qr&amp;chs=200x200&amp;chld=L|0&amp;choe=UTF-8&amp;chl=' + project.url + '" class="qrcode">\
                                        </a>\
                                    </td>\
                                    <td class="developer">' + project.developer + '</td>\
                                    <td class="remark">' + project.remark + '</td>\
                                    <td class="updated_at">' + project.updated_at + '</td>\
                                    <td class="action"><a href="###" data-id="' + project._id + '" class="lnk_edit">编辑</a><a href="###" data-id="' + project._id + '" class="lnk_destory">删除</a></td>\
                                </tr>';
                    });
                } else {
                    html + '<tr><td colspan="8">暂无数据</td></tr>';
                }

                $('.ui_table tbody').html(html);

                $('.ui_table tbody tr').hover(function () {
                    $(this).addClass('row_hover');
                }, function () {
                    $(this).removeClass('row_hover');
                });

                $('.ui_paginator').paginator({
                    pageSize: data.limit,
                    total: data.total,
                    pageIndex: pageIndex,
                    callback: 'MTE.api.load'
                });
            }
        });
    }
}