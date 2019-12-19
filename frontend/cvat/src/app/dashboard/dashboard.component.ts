import { Component, OnInit, Input, ComponentRef, ComponentFactoryResolver, OnDestroy,
ViewContainerRef, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TaskConfigurationModalComponent } from '../task-configuration-modal/task-configuration-modal.component';
import { DashboardService } from '../dashboard.service';
import { Task } from '../models/task/task';
import { DashboardItemComponent } from '../dashboard-item/dashboard-item.component';
import { AnnotationFormat } from '../models/annotation-formats/annotation-format';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @ViewChild('taskView', {static: true, read: ViewContainerRef}) vc: ViewContainerRef;
  title='CVAT Dashboard';
  taskRef: ComponentRef<any>[]=[];
  message: string;

  constructor(private matDialog: MatDialog, private dashboardService: DashboardService,
  private CFR: ComponentFactoryResolver) { }

  ngOnInit() {

    forkJoin(
      this.dashboardService.getAnnotationFormats(),
      this.dashboardService.getTasks(),
    ).subscribe( results=>{
      for(let task of results[1]){
        const componentFactory=this.CFR.resolveComponentFactory(DashboardItemComponent);
        const componentRef=this.vc.createComponent(componentFactory);
        componentRef.instance.task=task;
        componentRef.instance.annotationFormats=results[0];
        componentRef.instance.compInteraction=this;
        this.taskRef.push(componentRef);
      }
    }
  );
}

  dashboardCreateTaskButton() {
    const dialogRef = this.matDialog.open(TaskConfigurationModalComponent, {
     width: '500px',
   });
  }

  //tid stands for task id
  delete(id: number){
    this.dashboardService.deleteTask(id).subscribe(
      (val) => {

        try{
          let componentRef = this.taskRef.find(x => x.instance.task.id === id);
          this.taskRef=this.taskRef.filter(x=>x.instance.task.id!=id);
          componentRef.destroy();

        }
        catch(e){
          this.message="Delete encountered an error: "+e.error;
          this.matDialog.open(this.messageTemplate);
        }
      }
    );
  }

  navigateToUserGuide(){
    window.location.href="http://localhost:8080/documentation/user_guide.html";
  }

}
