import * as fs from "tns-core-modules/file-system";
import { getFile } from "tns-core-modules/http";
import * as fileSystem from "tns-core-modules/file-system";
import { Folder } from "tns-core-modules/file-system";
import { isAndroid, platform } from "tns-core-modules/platform";
import { alert } from "tns-core-modules/ui/dialogs";
import { Color } from "tns-core-modules/color";
import * as Toast from "nativescript-toast";
import { LocalNotifications } from "nativescript-local-notifications";
import { leftProperty } from "@nativescript/core/ui/layouts/absolute-layout";
let gestures = require("ui/gestures");
const permissions = require("nativescript-permissions");

export default {
  data() {
    return {
      text: {
        menu: "Menu",
        down: "Download",
        back: "Back",
        author: "Author",
        resolution: "Resolution",
        tags: "tags",
        love: "Make with love 💚",
        downloading: "Downloading...",
        have: "Already have!",
        input: "Enter tags...",
        search: "Search",
        searchText: "Tags:",
        settings: "Settings",
        hide: "Hide existing images",
        add: "added",
        remove: "removed",
        complete: {
          downloaded: "Downloaded!",
          path: "File path",
        },
        error: "Error!",
      },
      img: [],
      Numpage: 1,
      show: false,
      nowimg: {},
      scrollOffset: 0,
      loaded: false,
      have: [],
      needScroll: 0,
      nowScroll: 0,
      list: true,
      menu: false,
      listTags: [],
      tags: "",
      tagsArray: [],
      nsfm: false,
      hide: false
    };
  },
  async created() {
    this.getImages();
    this.getTags();
    require("tns-core-modules/application").android.on(
      require("tns-core-modules/application").AndroidApplication
        .activityBackPressedEvent,
      this.cancelBack
    );

    LocalNotifications.hasPermission();

    LocalNotifications.addOnMessageReceivedCallback((notificationData) => {
      console.log("Notification received: " + JSON.stringify(notificationData));
    });

    let lang;
    lang = java.util.Locale.getDefault().getLanguage();

    if (lang == "ru") {
      this.text = {
        menu: "Меню",
        down: "Скачать",
        back: "Назад",
        author: "Автор",
        resolution: "Разрешение",
        tags: "Теги",
        love: "Сделано с любовью 💚",
        downloading: "Загрузка...",
        have: "Уже скачано!",
        input: "Введите теги...",
        search: "Поиск",
        searchText: "Теги:",
        settings: "Настройки",
        hide: "Скрыть скачанные изображения",
        add: "добавлен",
        remove: "убран",
        complete: {
          downloaded: "Скачано!",
          path: "Путь к файлу",
        },
        error: "Ошибка!",
      };
    }

    permissions
      .requestPermission(
        android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
        "I need these permissions because I'm cool"
      )
      .then(() => {
        const sdDownloadPath = android.os.Environment.getExternalStoragePublicDirectory(
          android.os.Environment.DIRECTORY_DOWNLOADS
        ).toString();

        const myAppFolder = fs.Folder.fromPath(
          fs.path.join(sdDownloadPath, "Booba")
        );

        myAppFolder
          .getEntities()
          .then((entities) => {
            entities.forEach((entity) => {
              this.have.push({ id: entity.name.split(".")[0].toString() });
            });
          })
          .catch((err) => {
            console.log(err);
          });
      });
  },
  methods: {
    changeHide() {
      if(this.hide) {
        this.hide = false;
      } else {
        this.hide = true;
      }
      this.Numpage = 1;
      this.img = [];
      this.getImages();
    },
    changeNSFM() {
      if (this.nsfm) {
        this.nsfm = false;
      } else {
        this.nsfm = true;
      }
      this.Numpage = 1;
      this.img = [];
      this.getImages();
    },
    search() {
      this.list = true;
      this.menu = false;
      this.img = [];
      this.Numpage = 1;
      this.getImages();
      this.tagsArray = this.tags.split(" ");
    },
    checkTag(name) {
      if (this.tags.indexOf(name) > -1) {
        this.tagsArray.push(name);
        this.tags = this.tagsArray.join(" ");
        return true;
      } else {
        return false;
      }
    },
    changeTag(name) {
      if (this.tags.indexOf(name) == -1) {
        this.tagsArray.push(name);
      } else {
        const index = this.tagsArray.indexOf(name);
        if (index > -1) {
          this.tagsArray.splice(index, 1);
        }
      }
      this.tags = this.tagsArray.join(" ");
    },
    getTags() {
      fetch(`https://konachan.net/tag.xml?order=count&limit=500`)
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          let parsed = [];
          data.split("<tag").forEach((i, ind) => {
            if (ind == 0 || ind == 1) return;
            let obj = {
              id: i.split(` id="`)[1].split('"')[0],
              name: i.split(` name="`)[1].split('"')[0],
              count: i.split(` count="`)[1].split('"')[0],
            };
            this.listTags.push(obj);
          });
        });
      console.log(this.listTags);
    },
    imageMenu(element) {
      this.nowimg = element;
      action("", "", [this.text.tags, this.text.down]).then((result) => {
        if (result == this.text.down) {
          this.imageDownload();
        }
      });
    },
    cancelBack(data) {
      data.cancel = true; // prevents default back button behavior
    },
    checkHave(id) {
      if (
        this.have.find((a) => {
          if (a.id.split("-konachan").join("") == id) return true;
        }) != undefined
      )
        return true;
    },
    getImages() {
      fetch(
        `https://konachan.net/post.xml?page=dapi&s=post&q=index&json=1&limit=50&page=${this.Numpage}&tags=${this.tags}`
      )
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          let parsed = [];
          data.split("<post ").forEach((i, ind) => {
            if (ind == 0) return;
            if (
              !this.nsfm &&
              (i.split(`rating="`)[1].split('"')[0] == "e" ||
                i.split(`rating="`)[1].split('"')[0] == "q")
            )
              return;
            if(this.hide && this.checkHave(i.split(` id="`)[1].split('"')[0])) return;
            this.img.push({
              link: i.split(`jpeg_url="`)[1].split('"')[0],
              low: i.split(`preview_url="`)[1].split('"')[0],
              data: {
                id: i.split(` id="`)[1].split('"')[0],
                rating: i.split(`rating="`)[1].split('"')[0],
                owner: i.split(`author="`)[1].split('"')[0],
                width: i.split(` width="`)[1].split('"')[0],
                height: i.split(` height="`)[1].split('"')[0],
                tags: i.split(` tags="`)[1].split('"')[0],
              },
            });
          });
          if(this.img.length < 15) {
            this.Numpage++;
            this.getImages();
          }
          this.loaded = true;
        });
    },
    pageLoaded(args) {
      var page = args.object;

      // let swipe = page.getViewById("swipable");
      // swipe.on(gestures.GestureTypes.swipe, this.openMenu);
      if (this.show) return;
    },
    openMenu(args) {
      if (!this.menu) {
        this.list = false;
        this.show = false;
        this.menu = true;
      } else {
        this.list = true;
        this.menu = false;
        setTimeout(() => {
          this.$refs.scrollLayout.nativeView.scrollToVerticalOffset(
            this.nowScroll,
            false
          );
        }, 50);
      }
    },
    next() {
      this.Numpage++;
      this.getImages();
    },
    back() {
      this.show = false;
      this.list = true;
      setTimeout(() => {
        this.$refs.scrollLayout.nativeView.scrollToVerticalOffset(
          this.nowScroll,
          false
        );
      }, 50);
    },
    onScroll(el) {
      if (!this.list) return;
      this.nowScroll = el.scrollY;
      this.needScroll = this.$refs.scrollLayout.nativeView.scrollableHeight;
      if (this.nowScroll == this.needScroll) {
        this.Numpage++;
        this.getImages();
      }
    },
    imageClick: function(element) {
      this.show = true;
      this.list = false;
      this.nowimg = element;
    },
    imageDownload: function() {
      let el = this.nowimg;
      if (this.checkHave(el.data.id)) {
        let toastHave = Toast.makeText(this.text.have);
        toastHave.show();
        return;
      }
      let toast = Toast.makeText(this.text.downloading);
      toast.show();
      const sdDownloadPath = android.os.Environment.getExternalStoragePublicDirectory(
        android.os.Environment.DIRECTORY_DOWNLOADS
      ).toString();
      console.log("sdDownloadPath: " + sdDownloadPath);

      const myAppFolder = fs.Folder.fromPath(
        fs.path.join(sdDownloadPath, "Booba")
      );
      console.log("myApp path: " + myAppFolder.path);

      myAppFolder
        .getEntities()
        .then((entities) => {
          entities.forEach((entity) => {
            console.log(entity.name);
          });
        })
        .catch((err) => {
          console.log(err);
        });

      permissions
        .requestPermission(
          android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
          "I need these permissions because I'm cool"
        )
        .then(() => {
          console.log(el.link);
          let downloadedFilePath = fileSystem.path.join(
            android.os.Environment.getExternalStoragePublicDirectory(
              android.os.Environment.DIRECTORY_DOWNLOADS
            ).getAbsolutePath(),
            `Booba/${el.data.id}-konachan.jpg`
          );
          getFile(el.link, downloadedFilePath).then(
            (resultFile) => {
              this.have.push({ id: el.data.id });
              LocalNotifications.schedule([
                {
                  title: this.text.complete.downloaded,
                  subtitle: this.text.love,
                  body: `${this.text.complete.path}:\n${resultFile.path}`,
                  bigTextStyle: false, // Allow more than 1 row of the 'body' text on Android, but setting this to true denies showing the 'image'
                  color: new Color("green"),
                  //   image: el.link,
                  thumbnail: el.low,
                  forceShowWhenInForeground: false,
                  channel: "Booba",
                },
              ])
                .then(() => {})
                .catch((error) => console.log("doSchedule error: " + error));
            },
            (error) => {
              alert({
                title: this.text.error,
                okButtonText: "OK",
                message: `${error}`,
              });
              console.log(error);
            }
          );
        });
    },
  },
};
