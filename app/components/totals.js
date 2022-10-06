import React from "react";
import { Text, View, FlatList } from "react-native";
import styles from "../common/styles";

export default Totals = ({ selectedMeal }) => {
  const getChargeText = (charge) => {
    const chargeName =
      charge === "Service charge" ? "serviceCharge" : charge.toLowerCase();
    if (selectedMeal[`${chargeName}Amount`]) {
      let chargeAmount = selectedMeal[`${chargeName}Amount`];
      if (selectedMeal[`${chargeName}Type`] === "percent")
        chargeAmount = getPercentageForString(
          selectedMeal[`${chargeName}Amount`]
        );
      return (
        <Text
          style={{ fontSize: 16, color: "#fff" }}
        >{`${charge}: £${chargeAmount.toFixed(2)}`}</Text>
      );
    }
  };

  const getPercentageForString = (charge) => (getSubTotal() * charge) / 100;

  const getFriendTotalsText = (item) => {
    return (
      <View>
        <View style={styles.totalsBreakdownContainer}>
          <Text style={styles.totalsItemName}>{item.name}</Text>
          <Text style={styles.totalsItemAmount}>
            £{getIndividualTotal(item).toFixed(2)}
          </Text>
        </View>
        <Text
          style={{
            marginBottom: 20,
            color: "white",
          }}
        >
          {getIndividualItems(item)}
        </Text>
      </View>
    );
  };

  const getIndividualTotal = (friend) => {
    const itemsTotal = friend.items
      .map((item) => roundToTwo(item.amount / item.friends.length))
      .reduce((a, b) => a + b, 0);
    return itemsTotal + getAddedChargesSummed(itemsTotal, true);
  };

  const getAddedChargesSummed = (subtotal, forIndividualFriend) =>
    ["serviceCharge", "tip", "discount", "tax"]
      .map((charge) => {
        let chargeResult;
        if (selectedMeal[`${charge}Type`] === "percent") {
          chargeResult = roundToTwo(
            (subtotal * selectedMeal[`${charge}Amount`]) / 100
          );
        } else if (forIndividualFriend) {
          chargeResult = roundToTwo(
            selectedMeal[`${charge}Amount`] / selectedMeal.friends.length
          );
        } else {
          chargeResult = selectedMeal[`${charge}Amount`];
        }
        return charge === "discount" ? -chargeResult : chargeResult;
      })
      .reduce((a, b) => a + b, 0);

  const roundToTwo = (num) => +(Math.round(num + "e+2") + "e-2");

  const getIndividualItems = (friend) => {
    return friend.items
      .map((item) =>
        item.friends.length === 1 ? item.name : `${item.name} (shared)`
      )
      .join(", ");
  };

  const getTotal = (amount) => {
    return amount + getAddedChargesSummed(amount);
  };

  const getSubTotal = () => {
    return selectedMeal.items
      .map((item) => roundToTwo(item.amount))
      .reduce((a, b) => a + b, 0);
  };

  const getFlatListHeight = () => {
    console.log(selectedMeal);
    const heights = ["56%", "53%", "50%", "47%", "43%"];
    const heightsIdx = [
      selectedMeal.serviceChargeAmount,
      selectedMeal.tipAmount,
      selectedMeal.taxAmount,
      selectedMeal.discountAmount,
    ].filter(Boolean).length;
    return heights[heightsIdx];
  };

  return (
    <View>
      <View style={styles.totalsInfoContainer}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            color: "#fff",
          }}
        >
          <Text style={styles.subTotalsInfoTitle}>
            Subtotal: £{getSubTotal().toFixed(2)}
          </Text>
          <Text style={styles.totalsInfoTitle}>
            Total: £{getTotal(getSubTotal()).toFixed(2)}
          </Text>
        </View>
        <FlatList
          data={["Service charge", "Tip", "Tax", "Discount"]}
          renderItem={({ item }) => getChargeText(item)}
          keyExtractor={(charge) => charge}
        />
      </View>
      <View style={styles.totalsBreakdownContainer}>
        <FlatList
          // style={{ height:  }}
          data={selectedMeal.friends}
          renderItem={({ item }) => getFriendTotalsText(item)}
          keyExtractor={(friend) => friend._id.toString()}
        />
      </View>
    </View>
  );
};
