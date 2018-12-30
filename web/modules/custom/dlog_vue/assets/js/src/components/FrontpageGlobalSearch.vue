<template>
  <div class="frontpage-global-search" v-click-outside="onClickOutside">
    <div class="frontpage-global-search__form"
         :class="{ 'frontpage-global-search__form--has-results': searchResults.length}">
      <input type="text"
             autocomplete="off"
             class="frontpage-global-search__search-input"
             placeholder="Поиск по материалам сайта"
             @input="onTextInput"
             @focus="onTextFocus"
             @keypress.enter="onButtonClick">
      <button class="frontpage-global-search__search-submit"
              @click="onButtonClick">Поиск
      </button>
    </div>

    <div class="frontpage-global-search__results"
         v-if="searchResults.length && !resultsHidden">
      <div v-for="value in searchResults"
           class="frontpage-global-search__result">
        <a :href="value.url">{{value.label}}</a>
      </div>
    </div>
  </div>
</template>

<script>
  import debounce from 'lodash-es/debounce';

  export default {
    data() {
      return {
        text: '',
        searchResults: {},
        resultsHidden: false,
      };
    },

    watch: {
      text(newValue, oldValue) {
        if (newValue.length > 2) {
          this.$store.dispatch('api/doSearchGlobal', newValue)
            .then(result => this.searchResults = result.items);
        }
        else {
          this.searchResults = {};
        }
      },
    },

    methods: {
      onTextInput: debounce(function(e) {
        this.text = e.target.value;
      }, 300),

      onTextFocus: function(e) {
        this.resultsHidden = false;
      },

      onButtonClick: function() {
        let url = new URL('/search', window.location.origin);
        url.searchParams.append('text', this.text);
        window.location.href = url.href;
      },

      onClickOutside: function(event) {
        this.resultsHidden = true;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .frontpage-global-search {
    position: relative;

    &__search-input {
      padding: 16px !important;
      border-radius: 4px 0 0 4px !important;
    }

    &__search-submit {
      color: white;
      background-color: #3f5efb;
      background-image: none;
      border-color: transparent;
      transition: all .15s ease-in-out;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.125);
      border-radius: 0 4px 4px 0;
      padding: 0 32px;
      text-transform: uppercase;
      font-weight: bold;
    }

    &__form {
      position: relative;
      z-index: 50;
      display: flex;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);
    }

    &__form--has-results {
      box-shadow: none;
    }

    &__results {
      position: absolute;
      z-index: 40;
      top: 54px;
      width: 100%;
      background-color: white;
      border: 1px solid #cccccc;
      border-radius: 0 0 4px 4px;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);
    }

    &__result {
      padding: 8px 16px;
      border-bottom: 1px solid #cccccc;

      &:hover {
        background-color: #3f5efb;

        a {
          color: white;
        }
      }

      &:last-child {
        border-bottom: unset;
      }
    }

    @media (max-width: 751px) {
      &__search-submit {
        padding: 0 8px;
        font-size: 18px;
        width: 130px;
      }
    }
  }
</style>