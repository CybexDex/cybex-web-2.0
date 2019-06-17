<template>
  <div class="cybex file-upload" :class="`${size}-size`" @drop="drop" @dragover="dragover">
    <cybex-btn @click="$refs.inputUpload.click()" d-flex tiny major>{{ $t('button.select-file') }}</cybex-btn>
    <span d-flex class="file-desc dirty" v-if="file">
      {{ file.name }}
      <v-btn @click="removeFile" icon class="file-remove" size="28">
        <v-icon>ic-cancel</v-icon>
      </v-btn>
    </span>
    <span
      v-else
      class="file-desc"
      @click="$refs.inputUpload.click()"
    >{{ $t('placeholder.file_support', {type: fileAccept}) }}</span>
    <input v-show="false" :accept="fileAccept" ref="inputUpload" type="file" @change="uploadFile">
  </div>
</template>

<script>
import CybexTextField from "~/components/theme/CybexTextField.vue";
export default {
  props: {
    size: {
      type: String,
      default: "large"
    },
    fileAccept: {
      type: String,
      default: "*"
    },
    // TODO: 允许上传多个样式
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      file: null
    };
  },
  components: {
    CybexTextField
  },
  methods: {
    dragover(ev) {
      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();
    },
    drop(ev) {
      console.log("File(s) dropped");

      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();
      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (ev.dataTransfer.items[i].kind === "file") {
            const file = ev.dataTransfer.items[i].getAsFile();
            console.log("... file[" + i + "].name = " + file.name);
            this.file = file;
          }
        }
        this.$emit("file-changed", this.file);
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.files.length; i++) {
          const file = ev.dataTransfer.files[i];
          this.file = file;
          console.log(
            "... file[" + i + "].name = " + ev.dataTransfer.files[i].name
          );
        }
        this.$emit("file-changed", this.file);
      }
    },
    uploadFile(e) {
      let files = e.target.files;
      if (files.length) {
        this.file = files[0];
        this.$emit("file-changed", files[0]);
      }
    },
    removeFile() {
      this.file = null;
      this.$refs.inputUpload.value = null;
      this.$emit("file-changed", null);
    }
  }
};
</script>