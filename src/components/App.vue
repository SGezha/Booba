<template>
  <Page
    @loaded="pageLoaded"
    androidStatusBarBackground="#181818"
    xmlns:nota="@nota/nativescript-webview-ext"
  >
    <ActionBar @tap="openMenu">
      <WrapLayout>
        <WrapLayout class="menu-bg">
          <Image
            src="~/assets/images/menu.png"
            width="20"
            height="20"
            verticalAlignment="center"
            class="menu"
          />
          <Label
            :text="text.menu"
            fontSize="24"
            verticalAlignment="center"
            class="menu-but"
          />
        </WrapLayout>

        <Image
          src="res://icon"
          width="40"
          height="40"
          verticalAlignment="center"
          class="icon"
        />
        <Label text="Booba" fontSize="24" verticalAlignment="center" />
      </WrapLayout>
    </ActionBar>

    <TabView
      v-if="menu"
      tabTextColor="grey"
      selectedTabTextColor="white"
      androidTabsPosition="bottom"
      tabBackgroundColor="#212121"
    >
      <TabViewItem title="Поиск">
        <transition name="bounce" appear>
          <StackLayout class="search">
            <Label text="Поиск тегов:" class="search-text" />
            <TextField v-model="tags" :hint="text.input" />
            <ListView class="tags-list" for="(tag, ind) in listTags">
              <v-template>
                <FlexboxLayout justifyContent="space-between">
                  <Label
                    :text="tag.name + ' (' + tag.count + ')'"
                    class="search-tag"
                    @tap="console.log('test')"
                  />
                  <Switch
                    :checked="checkTag(tag.name)"
                    @checkedChange="changeTag(tag.name)"
                  />
                </FlexboxLayout>
              </v-template>
            </ListView>
            <WrapLayout>
              <Button class="but-tag" :style="{ 'background': nsfm ? 'red' : 'white', 'color': nsfm ? 'white' : '#181818'}" text="NSFM" @tap="changeNSFM" />
              <Button
                top="500"
                class="but-tag download"
                :text="text.search"
                @tap="search"
              />
            </WrapLayout>
          </StackLayout>
        </transition>
      </TabViewItem>
      <TabViewItem title="Настройки">
        <Label text="Content for Tab 2" />
      </TabViewItem>
    </TabView>

    <transition name="bounce" appear>
      <ScrollView
        @scroll="onScroll"
        ref="scrollLayout"
        v-if="list"
        orientation="vertical"
        scrollBarIndicatorVisible="true"
        id="swipable"
      >
        <FlexboxLayout
          flexWrap="wrap"
          justifyContent="center"
          backgroundColor="#181818"
        >
          <Image
            @tap="imageClick(im, ind)"
            v-for="(im, ind) in img"
            width="49%"
            :style="{
              'border-color': checkHave(im.data.id) ? '#55ab00' : '#181818',
            }"
            :key="ind"
            :src="im.low"
            class="image"
            stretch="aspectFill"
            @longPress="imageMenu(im, ind)"
          />
        </FlexboxLayout>
      </ScrollView>

      <GridLayout v-if="show" rows="*,auto" backgroundColor="#181818">
        <ScrollView orientation="vertical" row="1">
          <WrapLayout class="info">
            <Label
              :text="`${text.author}: ${nowimg.data.owner}`"
              class="desc"
            />
            <Label
              :text="
                `${text.resolution}: ${nowimg.data.width}x${nowimg.data.height}`
              "
              class="desc"
            />
            <Button class="but" :text="text.back" @tap="back" />
            <Button
              top="500"
              class="but download"
              :text="text.down"
              @tap="imageDownload"
            />
          </WrapLayout>
        </ScrollView>

        <WebViewExt
          rowSpan="2"
          width="100%"
          height="110%"
          class="web"
          builtInZoomControls="true"
          displayZoomControls="false"
          supportZoom="true"
          :src="
            `<head> <meta name='viewport' content='width=device-width, initial-scale=0.1, maximum-scale=5.0, user-scalable=yes'> <style> * {margin: 0; padding: 0;} html { background: transparent; } img {width: 100vw; height: auto;} </style> </head> <body> <img src=` +
              nowimg.link +
              '> </body>'
          "
        ></WebViewExt>
      </GridLayout>
    </transition>
  </Page>
</template>

<script src="~/app.js"></script>

<style scoped>
@import "~/app.css";
</style>
