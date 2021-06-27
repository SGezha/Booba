<template>
  <Page @loaded="pageLoaded" androidStatusBarBackground="#181818">
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
      <TabViewItem :title="text.search">
        <transition name="bounce" appear>
          <StackLayout class="search">
            <Label :text="text.searchText" class="search-text" />
            <TextField v-model="tags" :hint="text.input" class="input-tag" />
            <ScrollView
              @scroll="onScrollTags"
              orientation="vertical"
              scrollBarIndicatorVisible="true"
              class="tags-list"
              ref="tagsScroll"
            >
              <FlexboxLayout flexWrap="wrap">
                <Label
                  v-for="(tag, ind) in getShowTag()"
                  :key="ind"
                  :text="tag.name + ' (' + tag.count + ')'"
                  class="search-tag"
                  @tap="changeTag(tag.name)"
                  :style="{
                    background:
                      tags.indexOf(tag.name) > -1 ? '#55ab00' : '#212121',
                  }"
                />
              </FlexboxLayout>
            </ScrollView>
            <WrapLayout>
              <Button
                class="but-tag"
                :style="{
                  background: nsfm ? 'red' : 'white',
                  color: nsfm ? 'white' : '#181818',
                }"
                text="NSFM"
                @tap="changeNSFM"
              />
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

      <TabViewItem :title="text.settings">
        <transition name="bounce" appear>
          <StackLayout class="search">
            <WrapLayout>
              <Label
                :text="`${text.select} Imageboard:`"
                class="settings-label"
                verticalAlignment="center"
              />
              <Button
                width="50%"
                :style="{
                  background: booru == `konachan` ? '#55ab00' : 'white',
                  color: booru == `konachan` ? 'white' : '#181818',
                }"
                text="Konachan.net"
                @tap="changeBooru(`konachan`)"
              />
              <Button
                width="50%"
                :style="{
                  background: booru != `konachan` ? '#55ab00' : 'white',
                  color: booru != `konachan` ? 'white' : '#181818',
                }"
                text="Gelbooru.com"
                @tap="changeBooru(`gelbooru`)"
              />
            </WrapLayout>
            <WrapLayout>
              <Label :text="text.quality" class="settings-label" />
              <WrapLayout>
                <Button
                  width="50%"
                  :style="{
                    background: !high_quality ? '#55ab00' : 'white',
                    color: !high_quality ? 'white' : '#181818',
                  }"
                  text="Preview"
                  @tap="changeQuality(false)"
                />
                <Button
                  width="50%"
                  :style="{
                    background: high_quality ? '#55ab00' : 'white',
                    color: high_quality ? 'white' : '#181818',
                  }"
                  text="Sample"
                  @tap="changeQuality(true)"
                />
              </WrapLayout>
            </WrapLayout>
            <WrapLayout>
              <Label :text="text.page" class="settings-label" />
              <TextField
                width="100%"
                v-model="numPage"
                :text="numPage"
                keyboardType="number"
                @textChange="selectPage"
                class="page"
              />
            </WrapLayout>
            <FlexboxLayout justifyContent="space-between">
              <Button
                width="100%"
                background="white"
                :text="text.clear"
                @tap="clearHistory"
              />
            </FlexboxLayout>

            <FlexboxLayout justifyContent="space-between">
              <Button
                width="100%"
                :style="{
                  background: hide ? '#55ab00' : 'white',
                  color: hide ? 'white' : '#181818',
                }"
                :text="text.hide"
                @tap="changeHide"
              />
            </FlexboxLayout>
          </StackLayout>
        </transition>
      </TabViewItem>
    </TabView>

    <transition name="bounce" appear>
      <PullToRefresh
        v-if="list"
        @refresh="refreshList"
        indicatorFillColor="#212121"
        indicatorColor="#ffffff"
      >
        <ScrollView
          @scroll="onScroll"
          ref="scrollLayout"
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
                'border-color': checkHave(im.data.id),
              }"
              :key="ind"
              :src="getImage(im)"
              class="image"
              stretch="aspectFill"
              @longPress="imageMenu(im, ind)"
            />

            <FlexboxLayout
              width="100%"
              flexWrap="wrap"
              justifyContent="center"
              class="loading-block"
            >
              <WrapLayout>
                <ActivityIndicator
                  width="40"
                  height="40"
                  verticalAlignment="center"
                  busy="true"
                  class="icon"
                />

                <Label
                  :text="`${text.loadingPage}${numPage}`"
                  fontSize="18"
                  color="white"
                  verticalAlignment="center"
                />
              </WrapLayout>
            </FlexboxLayout>
          </FlexboxLayout>
        </ScrollView>
      </PullToRefresh>

      <GridLayout v-if="show" rows="*,auto" backgroundColor="#181818">
        <ImageZoom
          rowSpan="2"
          :src="nowimg.mid"
          class="web"
          maxZoom="10"
          minZoom="1"
        />

        <ScrollView orientation="vertical" row="1">
          <WrapLayout class="info">
            <Label
              :text="`${text.author}: ${nowimg.data.owner}`"
              class="desc"
            />
            <Label
              :text="`${text.resolution}: ${nowimg.data.width}x${nowimg.data.height}`"
              class="desc"
            />
            <ScrollView orientation="horizontal">
              <WrapLayout height="95px" class="tags-block">
                <Label
                  v-for="(tag, img) in nowimg.data.tags
                    .split(' ')
                    .filter(function (el) {
                      return el != '';
                    })"
                  :key="img"
                  :text="tag"
                  class="desc-tags"
                  @tap="changeTag(tag)"
                  :style="{
                    background: tags.indexOf(tag) > -1 ? '#55ab00' : '#212121',
                  }"
                />
              </WrapLayout>
            </ScrollView>
            <WrapLayout>
              <Button class="but" :text="text.back" @tap="back" />
              <Button
                top="500"
                class="but download"
                :text="text.down"
                @tap="imageDownload"
              />
            </WrapLayout>
          </WrapLayout>
        </ScrollView>
      </GridLayout>
    </transition>
  </Page>
</template>

<script src="~/app.js"></script>

<style scoped>
@import "~/app.css";
</style>
