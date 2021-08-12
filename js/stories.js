"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;



/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
*/


function favHTML(story) {
  const isFavorite = currentUser.isFavorite(story);
  const type = isFavorite ? "fas" : "far";
      return `
      <span class="star">
      <i class="${type} fa-heart" id="${story.storyId}"></i>
      </span>`;
  
}

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}" >
      ${favHTML(story)}
      <span ><i id="delete-box ${story.storyId}" class="fas fa-trash-alt"> </i></span>

        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// calls for change to favorite or unfavorite a story
async function addOrRemoveFav (e){
  const storyId = e.target.id;
  const $tgt = e.target
  
  
  const story = storyList.stories.find(s => s.storyId === storyId);  // gets the story that needs to be favorited or unfavorited
  
  // checks for the status of the favorite icon then toggle 
  if ($tgt.className === "fas fa-heart") {
    await currentUser.unFavoriteAstory(story)
    $tgt.className = "far fa-heart"
    console.log("unfav")
  }
  else {
    await currentUser.favoriteAstory(story)
    $tgt.className = "fas fa-heart"
    console.log("fav")
  }
  
  
}


$storiesList.on("click", (".fa-heart"), addOrRemoveFav)

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// displays the submit form
function submitForm() {
  $("#submit-form").show()
}

// eventListner on submit nav
$submit.on("click", submitForm)


// calls for add story from the storylist class
async function submitNewStory(){
  $ownStory.hide()
  $favList.hide()
  // generates my token
  const user = currentUser
  // generate my story information
  let author = $("#author").val()
  let title = $("#title").val()
  let url = $("#url").val()

  // creates my data object
  const myData = {author, title, url}

  // stores the return value from the addStory call in myNewStory variable
  let myNewStory = await storyList.addStory(user, myData)

  // generate the story mark up for myNewStory
  const newStoryMarkUp = generateStoryMarkup(myNewStory)
  // update the page with newest story
  $allStoriesList.prepend(newStoryMarkUp)

  $("#submit-form").trigger("reset")
  $("#submit-form").hide()

}
// listens for submit click
$("#submit-form").on("submit", submitNewStory)




function allMyFavStory() {
  $allStoriesList.hide()
  $ownStory.hide()
  $favList.empty()
  $("#submit-form").hide()
  
  // checks for favorite stories if 
  if (currentUser.favorites.length === 0) {
    $favList.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      
      $favList.append($story);
      
    }
  }

  $favList.show();
  
}
$("#favorite").on("click", allMyFavStory)


function allMyStory() {
  $allStoriesList.hide()
  $favList.hide();
  $("#submit-form").hide()
  $ownStory.empty()

  // checks for own story
  if (currentUser.ownStories.length === 0) {
    $ownStory.append("<h5>No story yet!</h5>")
  } else {
    // loop through the users own story and generate mark up HTML
    for (let story of currentUser.ownStories){
      const $story = generateStoryMarkup(story);
      $ownStory.append($story)
    }
  }
  $ownStory.show()
}

$("#myStory").on("click", allMyStory)


// calls for delete action from the user class
async function remove(evt){
  const user = currentUser
  const storyId = evt.target.id.slice(11)
  
  await storyList.deleteAstory(user, storyId)
  allMyStory()

}
$storiesList.on("click", (".fa-trash-alt"), remove)
