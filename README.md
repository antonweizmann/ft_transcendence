This project is about doing something you’ve never done before.Remind yourself the beginning of your journey in computer science.Look at you now. Time to shine!

<div class="offcanvas offcanvas-end" tabindex="-1" id="friendsSidebar" aria-labelledby="friendsSidebarLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="friendsSidebarLabel">Friends Menu</h5>
          <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-0">
          <!-- Tabs for Friends, Requests, and Add Friends -->
          <ul class="nav nav-tabs nav-fill" id="friendsTab" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="friends-tab" data-bs-toggle="tab" data-bs-target="#friends" type="button" role="tab" aria-controls="friends" aria-selected="true">Friends</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="requests-tab" data-bs-toggle="tab" data-bs-target="#requests" type="button" role="tab" aria-controls="requests" aria-selected="false">Requests</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="add-friends-tab" data-bs-toggle="tab" data-bs-target="#add-friends" type="button" role="tab" aria-controls="add-friends" aria-selected="false">Add Friends</button>
            </li>
          </ul>

          <!-- Tab Content -->
          <div class="tab-content p-3" id="friendsTabContent">
            <!-- Friends Tab -->
            <div class="tab-pane fade show active" id="friends" role="tabpanel" aria-labelledby="friends-tab">
              <ul id="friendsList" class="list-group">
                <!-- Friends will be dynamically populated here -->
              </ul>
            </div>
            <!-- Requests Tab -->
            <div class="tab-pane fade" id="requests" role="tabpanel" aria-labelledby="requests-tab">
              <ul id="requestsList" class="list-group">
                <!-- Friend requests will be dynamically populated here -->
              </ul>
            </div>
            <!-- Add Friends Tab -->
            <div class="tab-pane fade" id="add-friends" role="tabpanel" aria-labelledby="add-friends-tab">
              <form id="addFriendForm" class="input-group">
                <input type="text" id="newFriendName" class="form-control" placeholder="Enter friend's username">
                <button type="submit" class="btn btn-primary">Add Friend</button>
              </form>
              <div id="addFriendFeedback" class="mt-2"></div>
            </div>
          </div>
        </div>
      </div>
