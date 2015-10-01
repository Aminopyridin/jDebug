module jDebug.inspector {

    export class JDebugComponentInfoWindow {

        private infoScope:IJDebugComponentInfoScope;
        private infoNode:HTMLElement;

        constructor(rootScope:ng.IScope, compile:ng.ICompileService, components:jasper.core.HtmlComponentRegistrar) {

            this.infoScope = <IJDebugComponentInfoScope>rootScope.$new();
            components.register({
                name: 'jdebugComponentInfo',
                ctrl: JDebugComponentInfo,
                properties: ['component','show'],
                events: ['parent', 'close', 'navigate'],
                template: `
                    <div class="jdebug-component-info" ng-if="vm.show">
                        <p><b>Component:</b> {{vm.component.name}}</p>
                        <p ng-if="vm.component.properties">
                            <b>Properties:</b>
                            <span ng-repeat="prop in vm.component.properties">{{::prop}}</span>
                        </p>
                        <p ng-if="vm.component.events">
                            <b>Events:</b>
                            <span ng-repeat="evnt in vm.component.events">{{::evnt}}</span>
                        </p>
                        <p ng-if="vm.component.templateFile">
                            <b>Template file:</b> <a href="" ng-click="vm.navigateToTemplate()">{{vm.component.templateFile}}</a>
                        </p>
                        <p ng-if="vm.component.path">
                            <b>Definition:</b>
                            <a href="" ng-click="vm.navigateToDef()">{{vm.component.path}}</a>
                        </p>
                        <p>
                            <a href="" ng-click="vm.navigateToParent()">Parent component</a>
                        </p>
                        <button type="button" ng-click="vm.closeWindow()">close</button>
                    </div>
                `
            });
            var node = compile('<jdebug-component-info bind-show="show" bind-component="component" on-navigate="onNavigate($event)" on-close="onClose()" on-parent="onParent()"></jdebug-component-info>')(this.infoScope);
            this.infoNode = node[0];
            document.body.appendChild(this.infoNode);
        }

        show(componentInfo:ComponentInfo, element:Element) {
            this.infoScope.show = true;
            this.infoScope.component = componentInfo;
            this.safeApply();
            var windowNode = <HTMLElement>this.infoNode.getElementsByClassName('jdebug-component-info')[0];

            var rect = element.getBoundingClientRect();

            var infoWindowWIdth = windowNode.clientWidth + 20 /* padding-left*/, infoWindowHeight = windowNode.clientHeight + 20 /*padding bottom*/;

            var left = rect.left + window.pageXOffset, top = rect.top + window.pageYOffset;
            var diffX = rect.left + infoWindowWIdth - window.innerWidth, diffY = rect.top + infoWindowHeight - window.innerHeight;
            if (diffX > 0) {
                left = left - diffX;
            }
            if (diffY > 0) {
                top = top - diffY;
            }


            windowNode.style.top = top + 'px';
            windowNode.style.left = left + 'px';
        }

        hide() {
            this.infoScope.show = false;
            this.infoScope.component = null;
            this.safeApply();
        }

        onParent(cb:Function) {
            this.infoScope.onParent = cb;
        }

        onClose(cb:Function) {
            this.infoScope.onClose = cb;
        }

        onNavigate(cb:Function) {
            this.infoScope.onNavigate = cb;
        }

        private safeApply(){
            if(!this.infoScope.$$phase){
                this.infoScope.$digest();
            }
        }
    }

    /**
     *
     */
    export class JDebugComponentInfo {
        parent:jasper.core.IEventEmitter;
        close:jasper.core.IEventEmitter;
        navigate:jasper.core.IEventEmitter;


        component:any;

        show:boolean;

        navigateToParent() {
            this.parent.next();
        }

        navigateToDef(){
            this.navigate.next(this.component.path);
        }

        navigateToTemplate(){
            this.navigate.next(this.component.templateFile);
        }

        closeWindow(){
            this.close.next();
        }
    }

    interface IJDebugComponentInfoScope extends ng.IScope {
        show: boolean;
        component: ComponentInfo;

        onParent: Function;
        onNavigate: Function;
        onClose: Function;
    }
}