        const formFieldsDef = {
            date: { label: '発行日 / 申請日', type: 'date', width: 'half' },
            to: { label: '宛先', type: 'textarea', placeholder: '株式会社〇〇\n経理担当 御中', width: 'half', rows: 2 },
            from: { label: '作成者 / 申請者情報', type: 'textarea', placeholder: '自社名\n部署名\n氏名', width: 'half', rows: 3 },
            subject: { label: '件名', type: 'text', placeholder: '〇〇に関する件', width: 'half' },
            extra: { label: '備考・特記事項', type: 'textarea', placeholder: '備考を入力してください', width: 'full', rows: 2 },
            deliveryDate: { label: '希望納期', type: 'text', placeholder: '202X年X月X日', width: 'half' },
            deliveryPlace: { label: '納品場所', type: 'text', placeholder: '貴社指定倉庫', width: 'half' },
            purpose: { label: '申請理由・目的', type: 'textarea', placeholder: '業務効率化のため必要', width: 'full', rows: 2 },
            vendor: { label: '希望購入先', type: 'text', placeholder: '株式会社〇〇', width: 'half' },
            period: { label: '対象期間', type: 'text', placeholder: '202X年X月度', width: 'half' },
            paymentInfo: { label: '振込先・支払期限', type: 'textarea', placeholder: '〇〇銀行 〇〇支店\n普通 1234567\n月末支払い', width: 'full', rows: 2 }
        };

        const docConfigs = {
            estimate: {
                id: 'estimate', title: '見積書',
                fields: ['date', 'to', 'from', 'subject', 'extra'],
                itemType: 'standard', showTax: true, message: '下記の通りお見積り申し上げます。',
                bgColor: '#f8fafc', themeColor: '#1d4ed8', themeHover: '#1e3a8a'
            },
            order: {
                id: 'order', title: '発注書',
                fields: ['date', 'to', 'from', 'subject', 'deliveryDate', 'deliveryPlace', 'extra'],
                itemType: 'standard', showTax: true, message: '下記の通り発注いたします。',
                bgColor: '#f0fdf4', themeColor: '#059669', themeHover: '#047857'
            },
            request: {
                id: 'request', title: '購入許諾書 (稟議)',
                fields: ['date', 'to', 'from', 'subject', 'purpose', 'vendor', 'extra'],
                itemType: 'standard', showTax: true, message: '下記の物品・サービスの購入を申請いたします。',
                bgColor: '#fffbeb', themeColor: '#d97706', themeHover: '#b45309'
            },
            expense: {
                id: 'expense', title: '支出報告書 (経費精算)',
                fields: ['date', 'to', 'from', 'subject', 'period', 'extra'],
                itemType: 'expense', showTax: false, message: '下記の通り、経費の支出を報告し精算を申請いたします。',
                bgColor: '#fef2f2', themeColor: '#dc2626', themeHover: '#b91c1c'
            },
            invoice: {
                id: 'invoice', title: '請求書',
                fields: ['date', 'to', 'from', 'subject', 'paymentInfo', 'extra'],
                itemType: 'standard', showTax: true, message: '下記の通りご請求申し上げます。',
                bgColor: '#faf5ff', themeColor: '#7e22ce', themeHover: '#6b21a8'
            }
        };


        let currentDocType = 'estimate';
        let docId = '';
        let formData = {};
        let items = [];

        const formatCurrency = (num) => Number(num).toLocaleString('ja-JP');

        const getToday = () => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        const formatDateJP = (dateStr) => {
            if(!dateStr) return '';
            const d = new Date(dateStr);
            if(isNaN(d.getTime())) return dateStr;
            const year = d.getFullYear(), month = d.getMonth() + 1, day = d.getDate();
            let era = '', eraYear = year;
            if (year >= 2019) { era = '令和'; eraYear = year - 2018; if(eraYear === 1) eraYear = '元'; }
            else if (year >= 1989) { era = '平成'; eraYear = year - 1988; }
            return `${era}${eraYear}年 ${month}月 ${day}日`;
        };

        const generateDocId = () => {
            const d = new Date();
            return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        };


        function init() {
            docId = generateDocId();
            formData.date = getToday();

            const btnContainer = document.getElementById('doc-type-buttons');
            Object.values(docConfigs).forEach(conf => {
                const btn = document.createElement('button');
                btn.className = `btn btn-outline ${conf.id === currentDocType ? 'active' : ''}`;
                btn.innerText = conf.title;
                btn.onclick = () => changeDocType(conf.id);
                btnContainer.appendChild(btn);
            });

            changeDocType('estimate');
            window.addEventListener('resize', adjustPreviewScale);
            
            let lastScrollY = window.scrollY;
            window.addEventListener('scroll', () => {
                const header = document.querySelector('.header');
                if (window.scrollY > lastScrollY && window.scrollY > 50) {
                    header.classList.add('header-hidden');
                } else {
                    header.classList.remove('header-hidden');
                }
                lastScrollY = window.scrollY;
            });
        }

        function changeDocType(type) {
            const oldConf = docConfigs[currentDocType];
            const newConf = docConfigs[type];

            Array.from(document.getElementById('doc-type-buttons').children).forEach((btn, idx) => {
                btn.classList.toggle('active', Object.keys(docConfigs)[idx] === type);
            });

            if (!oldConf || oldConf.itemType !== newConf.itemType || items.length === 0) {
                if (newConf.itemType === 'standard') {
                    items = [{ id: Date.now(), desc: '', qty: 1, price: 0, amount: 0 }];
                } else {
                    items = [{ id: Date.now(), date: getToday(), desc: '', amount: 0 }];
                }
            }
            currentDocType = type;
            
            document.documentElement.style.setProperty('--bg-body', newConf.bgColor);
            document.documentElement.style.setProperty('--primary', newConf.themeColor);
            document.documentElement.style.setProperty('--primary-hover', newConf.themeHover);

            renderForm();
            renderItemsInput();
            updatePreview();
            setTimeout(adjustPreviewScale, 50);
        }

        function renderForm() {
            const config = docConfigs[currentDocType];
            const container = document.getElementById('dynamic-form-fields');
            container.innerHTML = '';

            config.fields.forEach(fieldKey => {
                const def = formFieldsDef[fieldKey];
                const group = document.createElement('div');
                group.className = `form-group ${def.width === 'full' ? 'full-width' : ''}`;
                
                let inputHtml = '';
                if (def.type === 'textarea') {
                    inputHtml = `<textarea class="form-control" rows="${def.rows}" placeholder="${def.placeholder}" oninput="handleFormInput('${fieldKey}', this.value)">${formData[fieldKey] || ''}</textarea>`;
                } else {
                    inputHtml = `<input type="${def.type}" class="form-control" placeholder="${def.placeholder || ''}" value="${formData[fieldKey] || ''}" oninput="handleFormInput('${fieldKey}', this.value)">`;
                }

                group.innerHTML = `<label class="form-label">${def.label}</label>${inputHtml}`;
                container.appendChild(group);
            });
        }

        function handleFormInput(key, value) {
            formData[key] = value;
            updatePreview();
        }

        function renderItemsInput() {
            const config = docConfigs[currentDocType];
            const thead = document.getElementById('item-list-head');
            const tbody = document.getElementById('item-list-body');
            
            if (config.itemType === 'standard') {
                thead.innerHTML = `
                    <tr><th style="width: 40%;">内容 / 品名 / 摘要</th><th style="width: 15%;">数量</th><th style="width: 20%;">単価 (円)</th><th style="width: 15%; text-align:right;">金額 (円)</th><th style="width: 10%; text-align:center;">操作</th></tr>
                `;
                tbody.innerHTML = items.map((item, i) => `
                    <tr>
                        <td><input type="text" class="form-control" value="${item.desc}" oninput="updateItem(${i}, 'desc', this.value)" placeholder="例: ノートPC"></td>
                        <td><input type="number" class="form-control" value="${item.qty}" min="0" oninput="updateItem(${i}, 'qty', this.value)"></td>
                        <td><input type="number" class="form-control" value="${item.price}" min="0" step="1" oninput="updateItem(${i}, 'price', this.value)"></td>
                        <td class="col-amount">￥${formatCurrency(item.amount)}</td>
                        <td class="col-action"><button class="btn btn-danger" style="padding: 0.3rem 0.6rem;" onclick="removeItem(${i})">削除</button></td>
                    </tr>
                `).join('');
            } else if (config.itemType === 'expense') {
                thead.innerHTML = `
                    <tr><th style="width: 20%;">発生日</th><th style="width: 45%;">内容 / 摘要</th><th style="width: 25%;">金額 (円)</th><th style="width: 10%; text-align:center;">操作</th></tr>
                `;
                tbody.innerHTML = items.map((item, i) => `
                    <tr>
                        <td><input type="date" class="form-control" value="${item.date}" oninput="updateItem(${i}, 'date', this.value)"></td>
                        <td><input type="text" class="form-control" value="${item.desc}" oninput="updateItem(${i}, 'desc', this.value)" placeholder="例: 交通費 (東京-大阪)"></td>
                        <td><input type="number" class="form-control" value="${item.amount}" min="0" step="1" oninput="updateItem(${i}, 'amount', this.value)"></td>
                        <td class="col-action"><button class="btn btn-danger" style="padding: 0.3rem 0.6rem;" onclick="removeItem(${i})">削除</button></td>
                    </tr>
                `).join('');
            }
        }

        function addItemRow() {
            if (items.length >= 5) {
                alert("明細は最大5行までです。これ以上追加できません。");
                return;
            }
            const config = docConfigs[currentDocType];
            if (config.itemType === 'standard') {
                items.push({ id: Date.now(), desc: '', qty: 1, price: 0, amount: 0 });
            } else {
                items.push({ id: Date.now(), date: getToday(), desc: '', amount: 0 });
            }
            renderItemsInput();
            updatePreview();
        }

        function removeItem(index) {
            if (items.length > 1) {
                items.splice(index, 1);
                renderItemsInput();
                updatePreview();
            } else { alert('最低1行は必要です。'); }
        }

        function updateItem(index, field, value) {
            const config = docConfigs[currentDocType];
            if (['qty', 'price', 'amount'].includes(field)) value = parseFloat(value) || 0;
            items[index][field] = value;
            
            if (config.itemType === 'standard' && (field === 'qty' || field === 'price')) {
                items[index].amount = Math.floor(items[index].qty * items[index].price);
            }
            renderItemsInput();
            updatePreview();
        }

        function calculateTotals() {
            const config = docConfigs[currentDocType];
            let subtotal = items.reduce((sum, item) => sum + item.amount, 0);
            let tax = config.showTax ? Math.floor(subtotal * 0.1) : 0;
            let total = subtotal + tax;
            return { subtotal, tax, total };
        }

        function updatePreview() {
            const config = docConfigs[currentDocType];
            const paper = document.getElementById('document-preview');
            const totals = calculateTotals();

            const showStamp = (config.id === 'request' || config.id === 'expense');
            const stampHtml = showStamp ? `
                <table class="approval-stamp">
                    <tr><th>決裁</th><th>承認</th><th>担当</th></tr>
                    <tr><td></td><td></td><td></td></tr>
                </table>
            ` : '';

            let customFieldsHtml = '';
            if (config.id === 'order') {
                customFieldsHtml = `
                    <div class="meta-row"><span class="meta-label">希望納期</span><span class="meta-value">${formData.deliveryDate || '（未入力）'}</span></div>
                    <div class="meta-row"><span class="meta-label">納品場所</span><span class="meta-value">${formData.deliveryPlace || '（未入力）'}</span></div>`;
            } else if (config.id === 'request') {
                customFieldsHtml = `
                    <div class="meta-row"><span class="meta-label">希望購入先</span><span class="meta-value">${formData.vendor || '（未入力）'}</span></div>
                    <div class="meta-row"><span class="meta-label">申請理由・目的</span><span class="meta-value">${formData.purpose || '（未入力）'}</span></div>`;
            } else if (config.id === 'expense') {
                customFieldsHtml = `
                    <div class="meta-row"><span class="meta-label">対象期間</span><span class="meta-value">${formData.period || '（未入力）'}</span></div>`;
            }

            let tableHtml = '';
            if (config.itemType === 'standard') {
                const rows = items.map(i => `
                    <tr><td class="text-left">${i.desc}</td><td class="text-center">${i.qty > 0 ? i.qty : ''}</td>
                    <td class="text-right">${i.price > 0 ? '￥'+formatCurrency(i.price) : ''}</td><td class="text-right">￥${formatCurrency(i.amount)}</td></tr>
                `).join('');
                tableHtml = `<table class="doc-table"><thead><tr><th style="width: 45%;">内容・品名</th><th style="width: 15%;">数量</th><th style="width: 20%;">単価</th><th style="width: 20%;">金額</th></tr></thead><tbody>${rows}</tbody></table>`;
            } else {
                const rows = items.map(i => `
                    <tr><td class="text-center">${i.date ? formatDateJP(i.date) : ''}</td><td class="text-left">${i.desc}</td><td class="text-right">￥${formatCurrency(i.amount)}</td></tr>
                `).join('');
                tableHtml = `<table class="doc-table"><thead><tr><th style="width: 25%;">発生日</th><th style="width: 50%;">内容・摘要</th><th style="width: 25%;">金額</th></tr></thead><tbody>${rows}</tbody></table>`;
            }

            let summaryHtml = '';
            if (config.showTax) {
                summaryHtml = `
                    <table class="doc-summary">
                        <tr><th>小計</th><td>￥${formatCurrency(totals.subtotal)}-</td></tr>
                        <tr><th>消費税等 (10%)</th><td>￥${formatCurrency(totals.tax)}-</td></tr>
                        <tr><th>合計</th><td><strong>￥${formatCurrency(totals.total)}-</strong></td></tr>
                    </table>`;
            } else if (config.itemType === 'expense') {
                summaryHtml = `
                    <table class="doc-summary" style="width: 45%;">
                        <tr><th>合計金額</th><td style="font-size:16px;"><strong>￥${formatCurrency(totals.total)}-</strong></td></tr>
                    </table>`;
            }

            const receiptHtml = config.id === 'expense' ? `
                <div class="receipt-box">
                    <div class="receipt-box-title">【 領収書・レシート 貼付欄 】</div>
                    <div style="font-size: 12px; margin-top: 8px;">※枠内に収まらない場合は裏面または別紙に貼付してください。</div>
                </div>` : '';

            paper.innerHTML = `
                <div class="doc-top-header">
                    <div class="doc-date-no">
                        <div>${formatDateJP(formData.date)}</div>
                        <div>No: ${docId}</div>
                    </div>
                </div>

                <div class="doc-title">${config.title}</div>

                <div class="doc-address-block">
                    <div class="doc-to-block">
                        <div class="doc-to">${formData.to ? formData.to.replace(/\n/g, '<br>') : '（宛先未入力）'}</div>
                    </div>
                    <div class="doc-from-block">
                        <div class="doc-company">${formData.from ? formData.from.replace(/\n/g, '<br>') : '（作成者未入力）'}</div>
                        ${stampHtml}
                    </div>
                </div>

                <div class="doc-subject-block">
                    <div class="meta-row"><span class="meta-label">件名</span><span class="meta-value subject-value">${formData.subject || '（件名未入力）'}</span></div>
                    ${customFieldsHtml}
                </div>

                <div class="doc-total-block">
                    <div class="doc-msg">${config.message}</div>
                    <div class="doc-total-amount">
                        合計金額: <span>￥${formatCurrency(totals.total)}-</span>
                        ${config.showTax ? '<span class="tax-note">(税込)</span>' : ''}
                    </div>
                </div>

                ${tableHtml}
                ${summaryHtml}

                ${config.id === 'invoice' && formData.paymentInfo ? `
                    <div class="doc-section">
                        <div class="section-title-sm">お振込先・お支払期限</div>
                        <div class="section-content">${formData.paymentInfo}</div>
                    </div>
                ` : ''}

                <div class="doc-section">
                    <div class="section-title-sm">備考・特記事項</div>
                    <div class="section-content">${formData.extra || '特になし'}</div>
                </div>
                
                ${receiptHtml}
            `;
        }

        function adjustPreviewScale() {
            const wrapper = document.getElementById('preview-wrapper');
            const paper = document.getElementById('document-preview');
            const wrapperWidth = wrapper.clientWidth - 32;
            const paperWidth = paper.offsetWidth || 794;
            const paperHeight = paper.offsetHeight || 1123;

            if (wrapperWidth < paperWidth) {
                const scale = wrapperWidth / paperWidth;
                paper.style.transform = `scale(${scale})`;
                wrapper.style.height = `${(paperHeight * scale) + 64}px`;
            } else {
                paper.style.transform = 'none';
                wrapper.style.height = 'auto';
            }
        }


        async function exportDocument(type) {
            const element = document.getElementById('document-preview');
            const config = docConfigs[currentDocType];
            const dateStr = (formData.date || '').replace(/-/g, '');
            const filename = `${config.title}_${dateStr}`;
            
            const originalScrollY = window.scrollY;
            const originalScrollX = window.scrollX;
            window.scrollTo(0, 0);

            element.style.transform = 'none';
            
            await new Promise(resolve => setTimeout(resolve, 50));

            try {
                if (type === 'pdf') {
                    const opt = {
                        margin: 0, 
                        filename: `${filename}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { 
                            scale: 2, 
                            useCORS: true, 
                            logging: false,
                            // 修正点: キャプチャの開始位置を左上に強制します
                            scrollY: 0,
                            scrollX: 0
                        },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };
                    await html2pdf().set(opt).from(element).save();
                } 
                else if (type === 'jpg') {
                    const canvas = await html2canvas(element, { 
                        scale: 2, 
                        useCORS: true,
                          scrollY: 0,
                        scrollX: 0
                    });
                    const link = document.createElement('a');
                    link.download = `${filename}.jpg`;
                    link.href = canvas.toDataURL('image/jpeg', 0.98);
                    link.click();
                }
            } catch (error) {
                console.error("出力エラー:", error);
                alert("出力中にエラーが発生しました。");
            } finally {
                adjustPreviewScale();
                window.scrollTo(originalScrollX, originalScrollY);
            }
        }

        window.onload = init;
