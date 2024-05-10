def sts_daily_billing(garbage_inflow,contract_id,number_of_inflow,contracts,required_delivery,payment_per_ton, number_of_contracts,fine_factor):
    id=0
    contracts_dict={}
    for x in contracts:
        contract_id[x]=id
        id=id+1
    waste_sent=[0 for _ in range(number_of_contracts)]
    for i in range(number_of_inflow):
        c_id=contracts_dict[contract_id[i]]
        garbage_amount=garbage_inflow[i]
        waste_sent[c_id]=waste_sent[c_id]+garbage_amount
    profit={}
    deficit={}
    for x in contracts:
        c_id=contracts_dict[x]
        waste_sent[c_id]=waste_sent[c_id]/1000
        pay=waste_sent[c_id]*payment_per_ton[c_id]
        fine=max(0,required_delivery[c_id]-waste_sent[c_id])*fine_factor
        bill=pay-fine
        if bill>0:
            profit[x]=bill
        elif bill<0:
            deficit[x]=abs(bill)
    
    return profit,deficit
    