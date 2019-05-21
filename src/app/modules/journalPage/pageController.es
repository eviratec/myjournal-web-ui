/**
 * Copyright (c) 2019 Callan Peter Milne
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */

angular.module('MyJournalWebui.JournalPage')
  .controller('JournalPageController', JournalPageController);

JournalPageController.$inject = ['$api', '$scope', '$state', '$mdDialog', '$timeout', 'journal'];
function JournalPageController (  $api,   $scope,   $state,   $mdDialog,   $timeout,   journal) {

  const $journalPage = this;

  $journalPage.journal = journal;

  checkJournalExists();

  function checkJournalExists () {
    if (journal) {
      return;
    }

    navToUserDashboard();
  }

  $journalPage.createEntry = function ($event) {

    var confirm = $mdDialog.prompt()
      .title('Name your new entry')
      .placeholder('My Entry')
      .ariaLabel('Entry title')
      .initialValue('')
      .targetEvent($event)
      .ok('Create Entry')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function(result) {
      createEntry(result);
    }, function() {

    });

  };

  $journalPage.deleteJournal = function ($event) {

    let confirm = $mdDialog.confirm()
      .title('Are you sure?')
      .textContent(`This will permanently delete your journal: ${journal.Name}`)
      .ariaLabel('Delete journal')
      .targetEvent($event)
      .ok('Delete Journal')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      deleteJournal(journal.Id);
    }, function() {
      // do nothing
    });

  };

  $journalPage.renameJournal = function ($event) {

    var confirm = $mdDialog.prompt()
      .title('Rename Journal')
      .placeholder(journal.Name)
      .ariaLabel('Journal name')
      .initialValue(journal.Name)
      .targetEvent($event)
      .ok('Save')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function(newValue) {
      renameJournal(journal.Id, newValue);
    }, function() {
      // do nothing
    });

  };

  function renameJournal (journalId, newValue) {
    if (journal.Id !== journalId) {
      return;
    }

    $api.apiPutNewValue(`/journal/${journalId}/name`, newValue)
      .then(function (res) {
        updateJournalName(newValue);
        $scope.$emit(`journal:renamed`, journalId, newValue);
      })
      .catch(function (err) {
        console.log(err);
        notifyRenameJournalError();
      });
  }

  function updateJournalName (newValue) {
    $scope.$apply(function () {
      journal.Name = newValue;
    });
  }

  function deleteJournal (journalId) {
    if (journal.Id !== journalId) {
      return;
    }

    $api.apiDelete(`/journal/${journalId}`)
      .then(function (res) {
        navToUserDashboard();
      })
      .catch(function (err) {
        console.log(err);
        notifyDeleteJournalError();
      });
  }

  function notifyDeleteJournalError () {
    $mdDialog.show(
      $mdDialog.alert()
        .title('Error')
        .textContent('An unexpected error was encountered while deleting the journal.')
        .ariaLabel('Error notification')
        .ok('Ok')
    );
  }

  function notifyRenameJournalError () {
    $mdDialog.show(
      $mdDialog.alert()
        .title('Error')
        .textContent('An unexpected error was encountered while renaming the journal.')
        .ariaLabel('Error notification')
        .ok('Ok')
    );
  }

  function navToUserDashboard () {
    $state.go('app.user.dashboard');
  }

  function createEntry (title) {

    let newEntry = {
      JournalId: journal.Id,
      Summary: title,
    };

    $api.apiPost('/entries', newEntry)
      .then(function (res) {
        $timeout(function () {
          Object.assign(newEntry, res.data);
          newEntry.Id = res.data.Id;
        });
      })
      .catch(function (err) {
        console.log(err);
      });

    $journalPage.journal.Entries.push(newEntry);

  }

};
