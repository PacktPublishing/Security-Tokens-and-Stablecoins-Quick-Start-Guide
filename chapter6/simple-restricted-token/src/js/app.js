/**
 * Brian Wu
 * Book: Blockchain Security Token Offerings Quick Start Guide
 */
var clipboard = new ClipboardJS('.copy');
clipboard.on('success', function(e) {
  let activeTab = $("ul#menuTabs li.active a").text();
  if('transfer'===activeTab) {
    $('#transferTo').val(e.text);
  } else if('restriction'===activeTab) {
    $('#recipient').val(e.text);
  } else if('addWhitelist'===activeTab) {
    $('#addWhiteListAddress').val(e.text);
  } else if('verifyWhitelist'===activeTab) {
    $('#inputWhiteListAddress').val(e.text);
  }
});
$('#success-msg').hide();
$('#error-msg').hide();
function cleanMsg() {
  $("#error-msg").html("").hide();
  $('#success-msg').html("").hide();
}
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    // if (typeof web3 !== 'undefined') {
    //   App.web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    // }

    return App.initContract();
  },
  initContract: function() {
    App.bindEvents();
    App.initApp();
  },
  initApp: function() {
    $.getJSON("MyERC1404.json", function(myERC1404) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.MyERC1404 = TruffleContract(myERC1404);
      // Connect provider to interact with contract
      App.contracts.MyERC1404.setProvider(App.web3Provider);
        return App.render();
    });
  },
  render: function() {
    var crowdFundingInstance;
    // Load account data
    var i =0;
    $('#accts').empty();
    web3.eth.accounts.forEach( function(e){
        $('#accts').append($('<option>', {
            value:e,
            text : e
        }));
    })
    App.contracts.MyERC1404.deployed().then(function(instance) {
      myERC1404Instance = instance;
      return myERC1404Instance.tokenInfo();
    }).then(function(tokenMeta) {
        $("#address").text(tokenMeta[0]);
        $("#name").text(tokenMeta[1]);
        $("#symbol").text(tokenMeta[2]);
        $("#totalSupply").text(web3.fromWei(tokenMeta[3], "ether") + " ether");
    }).catch(function(error) {
      console.warn(error);
      $("#error-msg").html(error).show();
    });
  },

  bindEvents: function() {
    $(document).on('click', '#transferToBtn', App.handleTransfer);
    $(document).on('click', '#detectBtn', App.handleDetectTransferRestriction);
    $(document).on('click', '#loadMessage', App.handleMessageForTransferRestriction);
    $(document).on('click', '#addWhiteListBtn', App.handleAddAddressToWhitelist);
    $(document).on('click', '#verifyWhiteListBtn', App.handleVerifyWhitelistAddress);
  },

  handleTransfer: function(event) {
    event.preventDefault();
    cleanMsg();
    var sender = $('#accts').find(":selected").val();
    var transferValue =  $('#amtOutputId').val();
    var recipient = $('#transferTo').val();
    let message ="";
    const transferValueInWei = web3.toWei(transferValue, 'ether');
    App.contracts.MyERC1404.deployed().then(function(newInstance) {
      return newInstance.balanceOf(recipient);
    }).then(function(recipientValue) {
      message ="ERC1404 recipient amount (before): " +web3.fromWei(recipientValue, "ether") + " ether";
    });
    App.contracts.MyERC1404.deployed().then(function(instance) {
      return instance.transfer(recipient, transferValueInWei, {from: sender, gas:3500000});
    }).then(function(result) {
      App.contracts.MyERC1404.deployed().then(function(newInstance) {
        return newInstance.balanceOf(recipient);
      }).then(function(recipientValue) {
        $("#success-msg").html(message+ "<br/> ERC1404 recipient amount (after): " +web3.fromWei(recipientValue, "ether") + " ether"  ).show();

      });
    }).catch(function(err) {
      console.error(err);
      $("#error-msg").html(err).show();
    });
  },
  handleDetectTransferRestriction: function(event) {
    event.preventDefault();
    cleanMsg();
    var sender = $('#accts').find(":selected").val();
    var transferValue =  $('#amtOutputTransferRestriction').val();
    var recipient = $('#recipient').val();
    const transferValueInWei = web3.toWei(transferValue, 'ether');
    App.contracts.MyERC1404.deployed().then(function(instance) {
      return instance.detectTransferRestriction(sender, recipient, transferValueInWei, {  gas:3500000});
    }).then(function(code) {
      App.contracts.MyERC1404.deployed().then(function(newInstance) {
        return newInstance.messageForTransferRestriction(code);
      }).then(function(message) {
        if('SUCCESS'===message) {
          $("#success-msg").html("ERC1404 Message: " + message ).show();
        } else {
          $("#error-msg").html("ERC1404 Message: " + message ).show();
        }

      });

    }).catch(function(err) {
      console.error(err);
      $("#error-msg").html(err).show();
    });
  },
  handleMessageForTransferRestriction: function(event) {
    event.preventDefault();
    cleanMsg();
    $("#restrictionMsg").html("");
    App.contracts.MyERC1404.deployed().then(function(instance) {
      return instance.NON_WHITELIST_CODE();
    }).then(function(result) {
      App.contracts.MyERC1404.deployed().then(function(newInstance) {
        return newInstance.messageForTransferRestriction(result);
      }).then(function(message) {
        $("#restrictionMsg").html(message);
      });

    }).catch(function(err) {
      console.error(err);
      $("#error-msg").html(err).show();
    });
  },
  handleAddAddressToWhitelist: function(event) {
    event.preventDefault();
    cleanMsg();
    var operator =  $('#addWhiteListAddress').val();
    var sender = $('#accts').find(":selected").val();
    App.contracts.MyERC1404.deployed().then(function(instance) {
      return instance.addAddressToWhitelist(operator, { from: sender, gas:3500000});
    }).then(function(result) {
      $("#success-msg").html("Success add " + operator + " to white List").show();
    }).catch(function(err) {
      console.error(err);
      $("#error-msg").html(err).show();
    });
  },
  handleVerifyWhitelistAddress: function(event) {
    event.preventDefault();
    cleanMsg();
    var operator =  $('#inputWhiteListAddress').val();
    App.contracts.MyERC1404.deployed().then(function(instance) {
      return instance.whitelist(operator, { gas:3500000});
    }).then(function(result) {
      if(result) {
        $("#success-msg").html("The Address: " + operator + " is in white List").show();
      } else {
        $("#error-msg").html("The Address: " + operator + " is not in white List").show();
      }

    }).catch(function(err) {
      console.error(err);
      $("#error-msg").html(err).show();
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
