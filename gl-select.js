 (function() {
    const template = document.createElement('template');

    template.innerHTML = `
      <style>
        .gl-select-container * { box-sizing: border-box; }
        .gl-select-container {
            display: inline-block;
            overflow: auto;
        }
        .gl-select-value { 
            position: relative;
            display: block; 
            height: 36px;
            line-height: 36px;
            padding: 0 35px;
            border: 1px solid #BBBBBB;
            border-radius: 3px; 
            outline: 0; 
            overflow: hidden;
        }
        .gl-select-value::before, 
        ::slotted(option)::before {
            position: absolute;
            top: 11px; left: 12px;
            width: 12px; height: 12px;
            background: #FEA42A;
            border-radius: 50%;
            content: '';
        }
        .gl-select-value::after { 
            position: absolute;
            top: 13px; right: 12px;
            width: 0; height: 0;
            border-style: solid;
            border-width: 8px 6px 0 6px;
            border-color: #818C93 transparent transparent transparent;
            content: '';
        }
        .gl-select-container.open .gl-select-value, 
        .gl-select-container:not(.open) .gl-select-value:focus { 
            border-color: #6D97C1;
        }
        .gl-select-options {
            position: absolute;
            display: none; z-index: 1;
            /*width: inherit;*/
            width: auto;
            margin-top: 3px;
            overflow-y: auto;
            background: #FFF;
            border-radius: 3px; 
            border: 1px solid #BBBBBB;
        }

        .gl-select-container.open .gl-select-options { display: inline-block; }
        
        ::slotted(option) {
            position: relative;
            line-height: 36px;
            padding: 0 35px;
        }
        ::slotted(option:hover),
        ::slotted(option.selected) {
            background: #F3F3F3;
            user-select: none;
        }
        ::slotted(option)::before {
            background: #FE5A66;
        }
      </style>
      
      <div class="gl-select-container">
       <div class="gl-select-value" tabindex="0"></div>
       <div class="gl-select-options">
        <slot></slot>
       </div>
      </div>
    `;

    class GlSelect extends HTMLElement  {
        // Can apparently not extend HTMLSelectElement
        constructor() {
            super();

            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            this._open = false;
            this._value = '';
            this._currentOptionIndex = 0;
            this._currentHighlightedOption = this._currentOptionIndex;

            this.$container = this._shadowRoot.querySelector('.gl-select-container');
            this.$select = this._shadowRoot.querySelector('.gl-select-value');
            this.$options = this._shadowRoot.querySelector('.gl-select-options');

            this.$select.addEventListener('click', e => {
                this.toggleDropdown();
            });
            // TODO: Click outside = close
            this.$select.addEventListener('keydown', this.onKeyDown.bind(this));
        }

        connectedCallback() {
            // var observer = new MutationObserver(function(mutations) {
            //      mutations.forEach(function(mutation) {});
            // });

            // observer.observe(this, { childList: true })
            
            if (!this.hasChildNodes())
                return;

            // Set first options as default selected
            this.selectOption(0);

            // for (let option of this.children) {
            for (let i = 0; i < this.children.length; i++) {
                // Click handler
                this.children[i].addEventListener('click', function(e) {
                    this.selectOption(i);
                    this.toggleDropdown();
                }.bind(this));

                this.children[i].addEventListener('mouseenter', function(e) {
                    this.highlightOption(i);
                }.bind(this));

                // Selected attribute
                if (this.children[i].hasAttribute('selected')) {
                    this.selectOption(i);
                }
            }
        }

        toggleDropdown(e) {
            console.log('TOGGLE, current=', this._open);

            // Toggle dropdown
            this._open = !this._open;

            this._open ? 
                this.$container.classList.add('open') : 
                this.$container.classList.remove('open');

            if (this._open && this.hasChildNodes()) {
                // Adjust min-width of options list
                this.$options.style.minWidth = this.$container.offsetWidth+'px';
                
                // Scroll to selected
                this.children[this._currentOptionIndex].scrollIntoView();
            }
        }

        optionSelected(e) {
            this.$select.innerHTML = e.target.innerHTML;
            
            if (e.target.hasAttribute('value')) {
                this._value = e.target.getAttribute('value');
            } else {
                this._value = e.target.innerHTML;
            }

            this.toggleDropdown();
        }

        onKeyDown(e) {
            // e.preventDefault();

            if (/^(Enter|SpaceBar|\s|ArrowDown|Down|ArrowUp|Up)$/.test(e.key)) {
                // Open dropdown; aligned with default select interaction except 
                // also openend by arrow keys
                if (!this._open) {
                    this.toggleDropdown();
                    return;
                }
            }

            if (/^(Enter|Tab|Escape)$/.test(e.key)) {
                if (this._open) {
                    this.selectOption(this._currentHighlightedOption);
                    this.toggleDropdown();
                }
                return;
            }

            // Option selection
            let nextOptionIndex = 0;

            if (/^(ArrowDown|Down)$/.test(e.key)) {
                // Down
                nextOptionIndex = this._currentHighlightedOption + 1
            }
            else if (/^(ArrowUp|Up)$/.test(e.key)) {
                // Up
                nextOptionIndex = this._currentHighlightedOption - 1;
            }
            else if (/^(Home|End)$/.test(e.key)) {
                // Select first/last element
                nextOptionIndex = (e.key == 'Home' ? 0 : (this.children.length - 1));
            }

            if (nextOptionIndex < 0 || nextOptionIndex >= this.children.length)
                return;

            this.children[nextOptionIndex].scrollIntoView();

            this.selectOption(nextOptionIndex);
        }
        
        selectOption(index) {
            // Set option
            let selectedOption = this.children[index];

            if (!selectedOption) {
                return;
            }
            
            this.$select.innerHTML = selectedOption.innerHTML;
            this._currentOptionIndex = index;

            if (selectedOption.hasAttribute('value')) {
                this._value = selectedOption.getAttribute('value');
            } else {
                this._value = selectedOption.innerHTML;
            }

            this.highlightOption(index);
        }

        highlightOption(index) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].classList.remove('selected');
            }
            this.children[index].classList.add('selected');
            this._currentHighlightedOption = index;
        }

        get id() {
            return this.getAttribute('id');
        }

        set id(value) {
            this.setAttribute('id', value);
        }

        get value() {
            return this._value;
        }

        set value(value) {
            this.setAttribute('value', value);
        }

        get width() {
            return this.getAttribute('width');
        }

        set width(value) {
            this.setAttribute('width', value);
        }

        static get observedAttributes() {
            return ['id', 'width'];
        }

        attributeChangedCallback(name, oldVal, newVal) {
            this.render();
        }

        render() {
            this.$container.style.width = this.width;
             // this.$label.innerHTML = this.label;
        }
    }

    window.customElements.define('gl-select', GlSelect);
})();