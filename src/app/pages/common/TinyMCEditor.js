import React, { Component } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { injectIntl } from "react-intl";
import striptags from 'striptags';
import { URL_API } from '../../config/url';
class TinyMCEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            init_value: false
        }
    }

    componentDidMount = () => {
        // setTimeout(() => {
        //     if (!window.tinymce.activeEditor) {
        //         window.tinymce.activeEditor.execCommand('mceInsertContent', false, this.props.content);
        //     }
        // }, 3000);
        let { init_value } = this.state;
        this.setValueValidate(this.props.content, init_value);
    }
    componentWillReceiveProps(props) {
        // let { init_value } = this.state;
        // if (props.content && !init_value && window.tinymce) {
        //     window.tinymce.activeEditor.execCommand('mceInsertContent', false, this.props.content);
        //     this.setState({
        //         init_value: true
        //     })
        // }
        let { init_value } = this.state;
        // kiểm tra đã init value chưa.nếu có giá trị thì update là rồi
        if (!init_value && props["content"]) {
            init_value = true;
            this.setState({
                init_value
            })
        }

        if (props.content && this.props.content != props.content) {
            this.setValueValidate(props.content, init_value);
        }
    }

    setValueValidate = (value, init_value) => {
        if (value == "<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n\n</body>\n</html>") {
            value = '';
        }
        let { form } = this.props
        if (form) {
            let field = this.props.field || this.props.name
            form.setFieldsValue({ [field]: value });
            //nếu đã khởi tạo value thì validate
            if (init_value) {
                form.validateFields([field], (err, values) => { })
            }
        }
    }

    handleEditorChange = (e) => {
        this.props.handleChange(this.props.name, e.target.getContent());


    }
    save = (e) => {

    }
    // imageGallery = () => {
    //     this.Gallery.current.showModal();
    // }

    // addImageInGallery = (url) => {
    //     // windown.tinymce.activeEditor.execCommand('mceInsertContent', false, `<img src='${url}' />`);
    // }
    render() {
        let thiss = this;
        let { content } = this.props;
        return (
            <Editor
                apiKey='rkqhr3ua2g4ewjlf9b2wef1tkbujktl6z55gumtr5zaizrfd'
                initialValue={content}
                // value={content}

                init={{
                    height: 500,
                    // selector: 'textarea',
                    automatic_uploads: true,
                    // images_upload_url: `${URL_API}api/admin/uploadThumnail`,
                    images_upload_handler: function (blobInfo, success, failure) {
                        var xhr, formData;
                    
                        xhr = new XMLHttpRequest();
                        xhr.withCredentials = false;
                        xhr.open('POST', `${URL_API}api/admin/uploadThumnail`);
                    
                        xhr.onload = function() {
                          var json;
                    
                          if (xhr.status != 200) {
                            failure('HTTP Error: ' + xhr.status);
                            return;
                          }
                    
                          json = JSON.parse(xhr.responseText);
                          if (!json || typeof json.data.url != 'string') {
                            failure('Invalid JSON: ' + xhr.responseText);
                            return;
                          }
                          
                          success(json.data.url);
                        };
                    
                        formData = new FormData();
                        formData.append('file', blobInfo.blob(), blobInfo.filename());
                    
                        xhr.send(formData);
                    },
                    extended_valid_elements: 'b/strong,i/em',
                    // images_upload_base_path: 'http://upload.vietlook.vn',
                    images_upload_credentials: true,
                    fontsize_formats: '11px 12px 14px 16px 18px 24px 36px 48px',
                    plugins: 'save link preview fullpage paste searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help ',
                    menubar: 'file edit insert view format table tools help',
                    toolbar: 'undo redo | fontselect | fontsizeselect | bold italic strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat | code | image | getimage | link | media | colorpicker | save paste | restoredraft ',
                    font_formats: 'Avenir=avenir,Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',
                    toolbar_mode: 'wrap',
                    language: 'en',
                    // language_url: '/static/languages/vi.js',
                    formats: {
                        bold: { inline: 'b', remove: 'all' },
                        italic: { inline: 'i', remove: 'all' },
                        underline: { inline: 'u', exact: true },
                        strikethrough: { inline: 'strike', exact: true }
                    },
                    paste_preprocess: function (plugin, args) {
                        args.content = striptags(args.content, ['img', 'p', 'audio', 'iframe', 'video', 'a', 'ul', 'i', 'li', 'b','u']);
                    },
                    save_onsavecallback: thiss.save,
                }}
                onChange={this.handleEditorChange} />
        );
    }
}

export default injectIntl(TinyMCEditor);

