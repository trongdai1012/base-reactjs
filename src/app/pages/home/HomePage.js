import React, { Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { LayoutSplashScreen } from "../../../_metronic";

{/* =============Dashboard============= */}
const Dashboard = lazy(() =>
  import("../dashboard/Dashboard")
);

const dashboardColla = lazy(() =>
  import("../collaborators/DasboardColla")
);
{/* ==================================== */}
{/* =============Order============= */}
const CreateOrderWholseSale = lazy(() =>
  import("../contract/CreateOrderWholseSale")
);

const createWholeSale = lazy(() =>
  import("../contract/createWholeSale")
);

const ListOrder = lazy(() =>
  import("../contract/ListOrder")
);

const createOrder = lazy(() =>
  import("../contract/createOrder")
);

const wholeSale = lazy(() =>
  import("../contract/WholeSaleOrder")
);

const wholeSaleBuy = lazy(() =>
  import("../contract/WholeSaleBuyOrder")
);

const OrderTrial = lazy(() =>
  import("../contract/OrderTrial")
);

const CollabOrder = lazy(() =>
  import("../contract/CollabOrder")
);

const OrderColla = lazy(() =>
  import('../collaborators/ListCollaborators')
);
{/* ==================================== */}
{/* =============Key============= */}
const ListExchangeKey = lazy(() =>
  import("../exchangeKey/listExchangeKey")
);

const ListRequestExchange = lazy(() =>
  import("../exchangeKey/ListRequest")
);

const SendTrial = lazy(() =>
  import("../contract/SendTrial")
);

const keyManage = lazy(() =>
  import('../keyManager/KeyManage')
);
{/* ==================================== */}
{/* =============Training============= */}
const VideoTraining = lazy(() =>
  import("../training/VideoTraining")
);

const DocumentTraining = lazy(() =>
  import("../training/DocumentTraining")
);
{/* ==================================== */}
{/* =============Customer============= */}
const ListCustomer = lazy(() =>
  import("../customer/ListCustomer")
);
{/* ==================================== */}
{/* =============Account============= */}
const Profile = lazy(() =>
  import("../account/Profile")
);
{/* ==================================== */}
{/* =============Tool============= */}
const LoginDistributor = lazy(() =>
  import("../auth/LoginDistributor")
);
{/* ==================================== */}
{/* =============Report============= */}
const AllSystem = lazy(() =>
  import("../report/AllSystem")
);
{/* ==================================== */}
{/* =============Distributor============= */}
const DetailDistributor = lazy(() =>
  import("../distributor/DetailDistributor")
);

const IntroduceDistributor = lazy(() =>
  import("../distributor/IntroduceDistributor")
);

const ListDistriIntro = lazy(() =>
  import("../distributor/ListDistriIntro")
);

const ListDistributors = lazy(() =>
  import('../distributor/ListDistributors')
);

const AddEditDistributor = lazy(() =>
  import('../distributor/AddEditDistributor')
);

const TopDistributor = lazy(() =>
  import('../distributor/TopDistributor')
);
const Potential = lazy(() =>
  import('../distributor/potential')
);
{/* ==================================== */}
{/* =============Notify============= */}
const ListNotity = lazy(() =>
  import("../notify/ListNotify")
);

const CreateNotify = lazy(() =>
  import("../notify/CreateNotify")
);

const NotifyDistributor = lazy(() =>
  import("../notify/NotifyDistributor")
);
{/* ==================================== */}
{/* =============Permission Manager============= */}
const EditUser = lazy(() =>
  import("../users/CreateUser")
);

const CreateUser = lazy(() =>
  import("../users/CreateUser")
);

const ListUser = lazy(() =>
  import("../users/ListUser")
);

const ListRole = lazy(() =>
  import("../users/role/ListRole")
);

const EditRole = lazy(() =>
  import("../users/role/EditRole")
);

const CreateRole = lazy(() =>
  import("../users/role/CreateRole")
);

const EditPermissionRole = lazy(() =>
  import("../users/role/EditPermissionRole")
);
{/* ==================================== */}
{/* =============Coupons============= */}
const DonateCoupons = lazy(() =>
  import("../giftCard/DonateCoupons")
);

const AddCampaign = lazy(() =>
  import("../giftCard/AddCampaign")
);

const ListCampaign = lazy(() =>
  import("../giftCard/ListCampaign")
);

const ListCoupons = lazy(() =>
  import("../giftCard/ListCoupons")
);

const GiveCoupons = lazy(() =>
  import("../giftCard/GiveCoupons")
);
{/* ==================================== */}
{/* =============Collaborator Notify============= */}
const ListNotityCollab = lazy(() =>
  import("../collabNotify/ListNotify")
);

const CreateCollabNotify = lazy(() =>
  import("../collabNotify/CreateNotify")
);
{/* ==================================== */}
{/* =============Collaborator============= */}
const ListCollaborators = lazy(() =>
  import("../collaboratorsDistri/ListCollaborators")
);

const AddCollaboration = lazy(() =>
  import("../collaboratorsDistri/AddCollaboration")
);

const NoticationCollab = lazy(() =>
  import("../collaborators/Notification")
);

const DetailCollaborator = lazy(() =>
  import("../collaboratorsDistri/DetailCollaborator")
);

const CustomerColla = lazy(() =>
  import('../collaborators/CustomerInvited')
);
{/* ==================================== */}
{/* =============Support Customer============= */}
const SupportCustomer = lazy(() =>
  import("../supportCustomer/SupportCustomer")
);
{/* ==================================== */}
{/* =============Error Page============= */}
const Error403 = lazy(() =>
  import("../common/Error403")
);
{/* ==================================== */}
{/* =============Distributor Bank============= */}
const ListBank = lazy(() =>
  import('../bank/ListBank')
);

const Gem = lazy(() =>
  import('../bank/Gem')
);
{/* ==================================== */}
{/* =============Payment============= */}
const LinkPayment = lazy(() =>
  import('../linkDistribution/LinkDistribution')
);

const LinkColla = lazy(() =>
  import('../collaborators/LinkCollaborator')
);

const ListOrderDistri = lazy(() =>
  import("../contract/ListOrderDistri")
);

export default function HomePage() {
  // useEffect(() => {
  //   console.log('Home page');
  // }, []) // [] - is required if you need only one call
  // https://reactjs.org/docs/hooks-reference.html#useeffect

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        {
          /* Redirect from root URL to /dashboard. */
          <Redirect exact from="/" to="/dashboard" />
        }

        {/* Route distributor */}
        <Route exact path="/distributor/list" component={ListDistributors} />
        <Route exact path="/distributor/edit/:id" component={ListDistributors} />
        <Route exact path="/distributor/add" component={AddEditDistributor} />
        <Route exact path="/distributor/top" component={TopDistributor} />
        <Route exact path="/distributor/detail/:id" component={DetailDistributor} />
        <Route exact path="/distributor/intro-distributor" component={IntroduceDistributor} />
        <Route exact path="/distributor/all-intro" component={ListDistriIntro} />
        <Route exact path="/distributor/potential" component={Potential} />

        {/* Route bank */}
        <Route exact path="/bank/info" component={ListBank} />
        <Route exact path="/bank/gem" component={Gem} />

        {/* Route order */}
        <Route exact path="/order/list-single" component={ListOrder} />
        <Route exact path="/order/single-add" component={createOrder} />
        <Route exact path="/order-trial" component={OrderTrial} />
        <Route exact path="/order/createSale" component={createWholeSale} />
        <Route exact path="/order/wholeSale-add" component={CreateOrderWholseSale} />
        <Route exact path="/order/list-wholeSale" component={wholeSale} />
        <Route exact path="/order/wholeBuySale" component={wholeSaleBuy} />
        <Route exact path="/order/send-trial" component={SendTrial} />
        <Route exact path="/order/collab-order" component={CollabOrder} />
        <Route exact path="/order/intro-order" component={ListOrderDistri} />

        {/* Route link payment */}
        <Route exact path="/link" component={LinkPayment} />

        {/* Route customer */}
        <Route exact path="/customers" component={ListCustomer} />
        {/* Route CTV */}
        <Route exact path="/collaborator/notification" component={NoticationCollab} />
        <Route exact path="/collaborator/order" component={OrderColla} />
        <Route exact path="/collaborator/customer" component={CustomerColla} />
        <Route exact path="/collaborator/link" component={LinkColla} />
        <Route exact path="/collaborator/dashboard" component={dashboardColla} />
        {/* Route profile */}
        <Route exact path="/profile" component={Profile} />
        {/* Route Report */}
        <Route exact path="/report/system" component={AllSystem} />

        {/* Route nofity */}
        <Route exact path="/notify/create" component={CreateNotify} />
        <Route exact path="/notify/list" component={ListNotity} />
        <Route exact path="/notify/distributor" component={NotifyDistributor} />

        {/*Route collaborator notify */}
        <Route exact path="/notifycollab/create" component={CreateCollabNotify} />
        <Route exact path="/notifycollab/list" component={ListNotityCollab} />

        {/* Route training */}
        <Route exact path="/training/video" component={VideoTraining} />
        <Route exact path="/training/document" component={DocumentTraining} />

        {/* Route permisions */}
        <Route exact path="/permissions/roles" component={ListRole} />
        <Route exact path="/permissions/roles/edit/:id" component={EditRole} />
        <Route exact path="/permissions/roles/edit-permission/:id" component={EditPermissionRole} />
        <Route exact path="/permissions/roles/add" component={CreateRole} />
        <Route exact path="/permissions/list" component={ListUser} />
        <Route exact path="/permissions/add" component={CreateUser} />
        <Route exact path="/permissions/edit/:id" component={EditUser} />

        {/* Route tools */}
        <Route exact path="/tools/viewDistributor" component={LoginDistributor} />

        {/* Route Key */}
        <Route exact path="/keyManage" component={keyManage} />

        {/* Route exchange key */}
        <Route exact path="/exchange-key" component={ListExchangeKey} />
        <Route exact path="/exchange/request" component={ListRequestExchange} />

        {/* Route gift card */}
        <Route exact path="/gift-card/donate-coupons" component={DonateCoupons} />
        <Route exact path="/gift-card/add-campaign" component={AddCampaign} />
        <Route exact path="/gift-card/list-campaign" component={ListCampaign} />
        <Route exact path="/gift-card/all-coupons" component={ListCoupons} />
        <Route exact path="/gift-card/give-coupons" component={GiveCoupons} />

        {/* Route Collaborators */}
        <Route exact path="/collaborators/list" component={ListCollaborators} />
        <Route exact path="/collaborators/add" component={AddCollaboration} />
        <Route exact path="/collaborators/detail/:id" component={DetailCollaborator} />

        {/* Route CSKH */}
        <Route exact path="/support-customer/create" component={SupportCustomer} />

        {/* Route other */}
        <Route path="/dashboard" component={Dashboard} />

        {/* <Redirect to="Error403" /> */}
        <Route path="/Error403" component={Error403} />
      </Switch>
    </Suspense>
  );
}
